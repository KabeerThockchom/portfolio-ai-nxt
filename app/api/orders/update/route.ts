import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { orderBook } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, qty, orderType, limitPrice } = body

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

    // Validate order can be updated (not Executed or Cancelled)
    if (order.orderStatus === "Executed") {
      return NextResponse.json(
        { success: false, error: "Cannot update an executed order" },
        { status: 400 }
      )
    }

    if (order.orderStatus === "Cancelled") {
      return NextResponse.json(
        { success: false, error: "Cannot update a cancelled order" },
        { status: 400 }
      )
    }

    // Build update object with only provided fields
    const updateData: any = {}

    // Update quantity if provided
    if (qty !== undefined && qty !== null) {
      if (qty <= 0) {
        return NextResponse.json(
          { success: false, error: "Quantity must be greater than 0" },
          { status: 400 }
        )
      }
      updateData.qty = qty
      // Recalculate amount based on new quantity
      updateData.amount = qty * order.unitPrice
    }

    // Update order type if provided
    if (orderType !== undefined && orderType !== null) {
      if (!["Market Open", "Limit"].includes(orderType)) {
        return NextResponse.json(
          { success: false, error: "Invalid order type. Must be 'Market Open' or 'Limit'" },
          { status: 400 }
        )
      }
      updateData.orderType = orderType

      // If changing to Market Open, clear limit price
      if (orderType === "Market Open") {
        updateData.limitPrice = null
      }
    }

    // Update limit price if provided (only valid for Limit orders)
    if (limitPrice !== undefined && limitPrice !== null) {
      const finalOrderType = orderType || order.orderType
      if (finalOrderType !== "Limit") {
        return NextResponse.json(
          { success: false, error: "Limit price can only be set for Limit orders" },
          { status: 400 }
        )
      }
      if (limitPrice <= 0) {
        return NextResponse.json(
          { success: false, error: "Limit price must be greater than 0" },
          { status: 400 }
        )
      }
      updateData.limitPrice = limitPrice
    }

    // Reset confirmation status to pending after update
    updateData.confirmationStatus = "pending_confirmation"

    // If no updates provided, return error
    if (Object.keys(updateData).length === 1) {
      // Only confirmationStatus was set
      return NextResponse.json(
        { success: false, error: "No update fields provided" },
        { status: 400 }
      )
    }

    // Update the order
    await db
      .update(orderBook)
      .set(updateData)
      .where(eq(orderBook.orderId, parseInt(orderId)))

    // Fetch updated order
    const updatedOrders = await db
      .select()
      .from(orderBook)
      .where(eq(orderBook.orderId, parseInt(orderId)))
      .limit(1)

    const updatedOrder = updatedOrders[0]

    return NextResponse.json({
      success: true,
      data: {
        order: updatedOrder,
        message: `Order ${orderId} updated successfully`,
      },
    })
  } catch (error: any) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order" },
      { status: 500 }
    )
  }
}
