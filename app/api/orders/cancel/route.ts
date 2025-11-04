import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { orderBook } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import type { CancelOrderRequest } from "@/types/portfolio"

export async function POST(request: Request) {
  try {
    const body: CancelOrderRequest = await request.json()
    const { userId, orderId } = body

    if (!userId || !orderId) {
      return NextResponse.json(
        { success: false, error: "userId and orderId are required" },
        { status: 400 }
      )
    }

    // Find the order
    const orders = await db
      .select()
      .from(orderBook)
      .where(
        and(
          eq(orderBook.orderId, orderId),
          eq(orderBook.userId, userId)
        )
      )
      .limit(1)

    if (orders.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    const order = orders[0]

    // Check if order can be cancelled
    if (order.orderStatus === "Cancelled") {
      return NextResponse.json(
        { success: false, error: "Order is already cancelled" },
        { status: 400 }
      )
    }

    if (order.orderStatus === "Executed") {
      return NextResponse.json(
        { success: false, error: "Cannot cancel executed order" },
        { status: 400 }
      )
    }

    // Update order status to Cancelled
    await db
      .update(orderBook)
      .set({ orderStatus: "Cancelled" })
      .where(eq(orderBook.orderId, orderId))

    return NextResponse.json({
      success: true,
      data: {
        message: `Order #${orderId} has been cancelled`,
        orderId,
      },
    })
  } catch (error) {
    console.error("Error cancelling order:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to cancel order",
      },
      { status: 500 }
    )
  }
}
