import { useState } from "react"
import type { Order } from "@/types/portfolio"

/**
 * Custom hook for managing order state
 * Handles order placement, history, and cancellation
 */
export function useOrders() {
  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false)

  // Order placement state
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false)
  const [lastOrderResult, setLastOrderResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // Clear orders
  const clearOrders = () => {
    setOrders([])
    setLastOrderResult(null)
  }

  return {
    // Orders state
    orders,
    setOrders,
    isLoadingOrders,
    setIsLoadingOrders,

    // Order placement state
    isPlacingOrder,
    setIsPlacingOrder,
    lastOrderResult,
    setLastOrderResult,

    // Actions
    clearOrders,
  }
}
