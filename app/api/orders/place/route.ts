import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { orderBook, assetType, userAccounts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { PlaceOrderRequest, PlaceOrderResponse, Order } from "@/types/portfolio"

export async function POST(request: Request) {
  try {
    const body: PlaceOrderRequest = await request.json()
    const { userId, accountId, symbol, buySell, orderType, qty, price } = body

    if (!userId || !accountId || !symbol || !buySell || !orderType || !qty) {
      return NextResponse.json(
        {
          success: false,
          error: "userId, accountId, symbol, buySell, orderType, and qty are required",
        },
        { status: 400 }
      )
    }

    // Validate Limit orders must have price
    if (orderType === "Limit" && !price) {
      return NextResponse.json(
        {
          success: false,
          error: "Limit orders require a price",
        },
        { status: 400 }
      )
    }

    // Find the asset
    const assets = await db
      .select()
      .from(assetType)
      .where(eq(assetType.assetTicker, symbol))
      .limit(1)

    if (assets.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Asset with ticker ${symbol} not found`,
        },
        { status: 404 }
      )
    }

    const asset = assets[0]

    // Get latest price for Market Open orders
    let unitPrice = price || 0

    if (orderType === "Market Open" && !price) {
      // For Market Open, we'd typically get the current market price
      // For now, use the last known price from asset history or a default
      // In production, this should fetch from a real-time price API
      unitPrice = 100 // Placeholder - replace with real price fetch
    }

    const amount = qty * unitPrice
    const settlementDate = new Date()
    settlementDate.setDate(settlementDate.getDate() + 2) // T+2 settlement

    // Verify account exists and get balance for Buy orders
    const account = await db
      .select()
      .from(userAccounts)
      .where(eq(userAccounts.accountId, accountId))
      .limit(1)

    if (account.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Account not found",
        },
        { status: 404 }
      )
    }

    const accountBalance = account[0].cashBalance

    // Check cash balance for Buy orders
    if (buySell === "Buy") {
      if (accountBalance < amount) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient cash balance. Required: $${amount.toFixed(2)}, Available: $${accountBalance.toFixed(2)}`,
          },
          { status: 400 }
        )
      }
    }

    // Insert order into order_book with pending confirmation status
    const newOrder = {
      userId,
      accountId,
      assetId: asset.assetId,
      orderType,
      symbol,
      description: asset.assetName,
      buySell,
      unitPrice,
      limitPrice: orderType === "Limit" ? price : null,
      qty,
      amount,
      settlementDate: settlementDate.toISOString().split("T")[0],
      orderStatus: "Placed",
      confirmationStatus: "pending_confirmation",
      orderDate: new Date().toISOString(),
    }

    // Insert and get returned order
    const insertedOrders = await db
      .insert(orderBook)
      .values(newOrder)
      .returning()

    const insertResult = insertedOrders[0]

    const order: Order = {
      orderId: insertResult.orderId,
      ...newOrder,
      asset,
    }

    // Calculate balance after trade for confirmation UI
    const balanceAfterTrade = buySell === "Buy" ? accountBalance - amount : accountBalance + amount

    const response: PlaceOrderResponse = {
      success: true,
      data: {
        order,
        message: `${buySell} order for ${qty} shares of ${symbol} placed successfully. Please confirm to execute.`,
        orderPreview: {
          orderId: insertResult.orderId,
          symbol,
          buySell,
          quantity: qty,
          estimatedPrice: unitPrice,
          estimatedTotal: amount,
          accountName: account[0].accountName,
          accountBalance,
          balanceAfterTrade,
        },
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error placing order:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to place order",
      },
      { status: 500 }
    )
  }
}
