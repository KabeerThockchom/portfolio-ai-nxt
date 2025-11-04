import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { orderBook, userAccounts, userTransactions, userPortfolio, assetType } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      )
    }

    // Fetch the order
    const orders = await db
      .select()
      .from(orderBook)
      .where(eq(orderBook.orderId, parseInt(orderId)))
      .limit(1)

    if (orders.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    const order = orders[0]

    // Check if order is pending confirmation
    if (order.confirmationStatus !== "pending_confirmation") {
      return NextResponse.json(
        { success: false, error: `Order cannot be confirmed. Status: ${order.confirmationStatus}` },
        { status: 400 }
      )
    }

    // Get account
    const account = await db
      .select()
      .from(userAccounts)
      .where(eq(userAccounts.accountId, order.accountId!))
      .limit(1)

    if (account.length === 0) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      )
    }

    const currentBalance = account[0].cashBalance

    // For Buy orders: deduct cash and add to holdings
    if (order.buySell === "Buy") {
      // Verify sufficient balance
      if (currentBalance < order.amount) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient funds. Required: $${order.amount.toFixed(2)}, Available: $${currentBalance.toFixed(2)}`,
          },
          { status: 400 }
        )
      }

      // Deduct cash from account
      await db
        .update(userAccounts)
        .set({ cashBalance: currentBalance - order.amount })
        .where(eq(userAccounts.accountId, order.accountId!))

      // Add to holdings or update existing
      const existingHolding = await db
        .select()
        .from(userPortfolio)
        .where(
          and(
            eq(userPortfolio.userId, order.userId),
            eq(userPortfolio.assetId, order.assetId)
          )
        )
        .limit(1)

      if (existingHolding.length > 0) {
        // Update existing holding
        const holding = existingHolding[0]
        const newTotalUnits = holding.assetTotalUnits + order.qty
        const newInvestmentAmount = holding.investmentAmount + order.amount
        const newAvgCost = newInvestmentAmount / newTotalUnits

        await db
          .update(userPortfolio)
          .set({
            assetTotalUnits: newTotalUnits,
            avgCostPerUnit: newAvgCost,
            investmentAmount: newInvestmentAmount,
          })
          .where(eq(userPortfolio.userPortId, holding.userPortId))
      } else {
        // Create new holding
        await db.insert(userPortfolio).values({
          userId: order.userId,
          assetId: order.assetId,
          assetTotalUnits: order.qty,
          avgCostPerUnit: order.unitPrice,
          investmentAmount: order.amount,
        })
      }

      // Create transaction record
      await db.insert(userTransactions).values({
        userId: order.userId,
        accountId: order.accountId,
        assetId: order.assetId,
        transType: "BUY",
        date: new Date().toISOString(),
        units: order.qty,
        pricePerUnit: order.unitPrice,
        cost: order.amount,
        description: `Buy ${order.qty} shares of ${order.symbol}`,
      })
    } else {
      // For Sell orders: add cash and reduce holdings
      // Get current holding
      const existingHolding = await db
        .select()
        .from(userPortfolio)
        .where(
          and(
            eq(userPortfolio.userId, order.userId),
            eq(userPortfolio.assetId, order.assetId)
          )
        )
        .limit(1)

      if (existingHolding.length === 0) {
        return NextResponse.json(
          { success: false, error: `No holdings found for ${order.symbol}` },
          { status: 400 }
        )
      }

      const holding = existingHolding[0]

      if (holding.assetTotalUnits < order.qty) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient shares. Required: ${order.qty}, Available: ${holding.assetTotalUnits}`,
          },
          { status: 400 }
        )
      }

      // Add cash to account
      await db
        .update(userAccounts)
        .set({ cashBalance: currentBalance + order.amount })
        .where(eq(userAccounts.accountId, order.accountId!))

      // Reduce holdings
      const newTotalUnits = holding.assetTotalUnits - order.qty

      if (newTotalUnits === 0) {
        // Remove holding entirely
        await db
          .delete(userPortfolio)
          .where(eq(userPortfolio.userPortId, holding.userPortId))
      } else {
        const proportionSold = order.qty / holding.assetTotalUnits
        const newInvestmentAmount = holding.investmentAmount * (1 - proportionSold)

        await db
          .update(userPortfolio)
          .set({
            assetTotalUnits: newTotalUnits,
            investmentAmount: newInvestmentAmount,
            // avgCostPerUnit stays the same
          })
          .where(eq(userPortfolio.userPortId, holding.userPortId))
      }

      // Create transaction record
      await db.insert(userTransactions).values({
        userId: order.userId,
        accountId: order.accountId,
        assetId: order.assetId,
        transType: "SELL",
        date: new Date().toISOString(),
        units: order.qty,
        pricePerUnit: order.unitPrice,
        cost: order.amount,
        description: `Sell ${order.qty} shares of ${order.symbol}`,
      })
    }

    // Update order status to Executed
    await db
      .update(orderBook)
      .set({
        orderStatus: "Executed",
        confirmationStatus: "confirmed",
      })
      .where(eq(orderBook.orderId, parseInt(orderId)))

    return NextResponse.json({
      success: true,
      data: {
        orderId: parseInt(orderId),
        message: `Order executed successfully. ${order.buySell} ${order.qty} shares of ${order.symbol} at $${order.unitPrice.toFixed(2)}`,
        newBalance: order.buySell === "Buy" ? currentBalance - order.amount : currentBalance + order.amount,
      },
    })
  } catch (error: any) {
    console.error("Error confirming order:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to confirm order" },
      { status: 500 }
    )
  }
}
