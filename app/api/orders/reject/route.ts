import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { orderBook } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

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
        { success: false, error: `Order cannot be rejected. Status: ${order.confirmationStatus}` },
        { status: 400 }
      )
    }

    // Update order status to Cancelled and confirmation status to rejected
    await db
      .update(orderBook)
      .set({
        orderStatus: "Cancelled",
        confirmationStatus: "rejected",
      })
      .where(eq(orderBook.orderId, parseInt(orderId)))

    return NextResponse.json({
      success: true,
      data: {
        orderId: parseInt(orderId),
        message: `Order rejected successfully. ${order.buySell} order for ${order.qty} shares of ${order.symbol} has been cancelled.`,
      },
    })
  } catch (error: any) {
    console.error("Error rejecting order:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reject order" },
      { status: 500 }
    )
  }
}
