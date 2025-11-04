import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { orderBook, assetType, userPortfolio } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import type { PlaceOrderRequest, PlaceOrderResponse, Order } from "@/types/portfolio"

export async function POST(request: Request) {
  try {
    const body: PlaceOrderRequest = await request.json()
    const { userId, symbol, buySell, orderType, qty, price } = body

    if (!userId || !symbol || !buySell || !orderType || !qty) {
      return NextResponse.json(
        {
          success: false,
          error: "userId, symbol, buySell, orderType, and qty are required",
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

    // Check cash balance for Buy orders
    if (buySell === "Buy") {
      // Get user's cash balance
      const cashHoldings = await db
        .select()
        .from(userPortfolio)
        .where(eq(userPortfolio.userId, userId))
        .leftJoin(assetType, eq(userPortfolio.assetId, assetType.assetId))
        .then((results) =>
          results.filter(
            ({ asset_type }) => asset_type?.assetClass?.toLowerCase() === "cash"
          )
        )

      const cashBalance = cashHoldings.reduce(
        (sum, { user_portfolio }) => sum + user_portfolio.assetTotalUnits,
        0
      )

      if (cashBalance < amount) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient cash balance. Required: $${amount.toFixed(2)}, Available: $${cashBalance.toFixed(2)}`,
          },
          { status: 400 }
        )
      }
    }

    // Insert order into order_book
    const newOrder = {
      userId,
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
      orderDate: new Date().toISOString(),
    }

    // Use raw SQL for insert since Drizzle's insert syntax varies
    const insertResult = db
      .insert(orderBook)
      .values(newOrder)
      .returning()
      .get()

    const order: Order = {
      orderId: insertResult.orderId,
      ...newOrder,
      asset,
    }

    const response: PlaceOrderResponse = {
      success: true,
      data: {
        order,
        message: `${buySell} order for ${qty} shares of ${symbol} placed successfully`,
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
