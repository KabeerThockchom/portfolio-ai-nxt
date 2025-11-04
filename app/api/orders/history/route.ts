import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { orderBook, assetType } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import type { OrderHistoryResponse, Order } from "@/types/portfolio"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      )
    }

    // Get all orders for the user, sorted by order date (newest first)
    const ordersData = await db
      .select()
      .from(orderBook)
      .where(eq(orderBook.userId, parseInt(userId)))
      .leftJoin(assetType, eq(orderBook.assetId, assetType.assetId))
      .orderBy(desc(orderBook.orderDate))

    const orders: Order[] = ordersData.map(({ order_book, asset_type }) => ({
      orderId: order_book.orderId,
      userId: order_book.userId,
      assetId: order_book.assetId,
      orderType: order_book.orderType,
      symbol: order_book.symbol,
      description: order_book.description || undefined,
      buySell: order_book.buySell as "Buy" | "Sell",
      unitPrice: order_book.unitPrice,
      limitPrice: order_book.limitPrice || undefined,
      qty: order_book.qty,
      amount: order_book.amount,
      settlementDate: order_book.settlementDate,
      orderStatus: order_book.orderStatus as "Placed" | "Under Review" | "Cancelled" | "Executed",
      orderDate: order_book.orderDate,
      asset: asset_type || undefined,
    }))

    const response: OrderHistoryResponse = {
      success: true,
      data: {
        orders,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching order history:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch order history",
      },
      { status: 500 }
    )
  }
}
