"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { usePortfolioApi } from "@/hooks/use-portfolio-api"
import type { Order } from "@/types/portfolio"
import { X, Check, Edit } from "lucide-react"

interface OrderHistoryTableProps {
  orders: Order[]
  userId: number
  onOrderCancelled?: () => void
  onOrderUpdated?: () => void
  onUpdateOrderClick?: (order: Order) => void
}

export function OrderHistoryTable({ orders, userId, onOrderCancelled, onOrderUpdated, onUpdateOrderClick }: OrderHistoryTableProps) {
  const { toast } = useToast()
  const { cancelOrder, confirmOrder, rejectOrder } = usePortfolioApi()
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Placed":
        return <Badge style={{ backgroundColor: "#FFE600", color: "#333333" }}>Placed</Badge>
      case "Under Review":
        return <Badge style={{ backgroundColor: "#CCCCCC", color: "#333333" }}>Under Review</Badge>
      case "Cancelled":
        return <Badge style={{ backgroundColor: "#EF4444", color: "#FFFFFF" }}>Cancelled</Badge>
      case "Executed":
        return <Badge style={{ backgroundColor: "#22C55E", color: "#FFFFFF" }}>Executed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getConfirmationBadge = (status: string) => {
    switch (status) {
      case "pending_confirmation":
        return <Badge variant="outline" style={{ color: "#FF9800" }}>Pending</Badge>
      case "confirmed":
        return <Badge style={{ backgroundColor: "#4CAF50", color: "#FFFFFF" }}>Confirmed</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    setProcessingOrderId(orderId)

    try {
      const result = await cancelOrder(userId, orderId)

      if (result.success) {
        toast({
          title: "Order Cancelled",
          description: result.data?.message || "Order has been cancelled successfully",
        })

        if (onOrderCancelled) {
          onOrderCancelled()
        }
      } else {
        toast({
          title: "Cancellation Failed",
          description: result.error || "Failed to cancel order",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setProcessingOrderId(null)
    }
  }

  const handleConfirmOrder = async (orderId: number) => {
    setProcessingOrderId(orderId)

    try {
      const result = await confirmOrder({ orderId })

      if (result.success) {
        toast({
          title: "Order Confirmed",
          description: result.data?.message || "Order has been executed successfully",
        })

        if (onOrderUpdated) {
          onOrderUpdated()
        }
      } else {
        toast({
          title: "Confirmation Failed",
          description: result.error || "Failed to confirm order",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setProcessingOrderId(null)
    }
  }

  const handleRejectOrder = async (orderId: number) => {
    setProcessingOrderId(orderId)

    try {
      const result = await rejectOrder({ orderId })

      if (result.success) {
        toast({
          title: "Order Rejected",
          description: result.data?.message || "Order has been rejected successfully",
        })

        if (onOrderUpdated) {
          onOrderUpdated()
        }
      } else {
        toast({
          title: "Rejection Failed",
          description: result.error || "Failed to reject order",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setProcessingOrderId(null)
    }
  }

  const canCancelOrder = (order: Order) => {
    return order.orderStatus === "Placed" || order.orderStatus === "Under Review"
  }

  const canConfirmOrder = (order: Order) => {
    return order.confirmationStatus === "pending_confirmation"
  }

  const canUpdateOrder = (order: Order) => {
    return order.orderStatus === "Placed" || order.orderStatus === "Under Review"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <p className="text-sm text-muted-foreground">
          {orders.length} {orders.length === 1 ? "order" : "orders"} found
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Confirmation</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="font-mono text-sm">#{order.orderId}</TableCell>
                  <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                  <TableCell>{getConfirmationBadge(order.confirmationStatus)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.orderType}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{order.symbol}</TableCell>
                  <TableCell>
                    <Badge
                      variant={order.buySell === "Buy" ? "default" : "secondary"}
                      style={{
                        backgroundColor: order.buySell === "Buy" ? "#FFE600" : "#999999",
                        color: "#333333"
                      }}
                    >
                      {order.buySell}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{order.qty.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(order.unitPrice)}
                    {order.limitPrice && (
                      <div className="text-xs text-muted-foreground">
                        Limit: {formatCurrency(order.limitPrice)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.amount)}
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(order.orderDate)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      {canConfirmOrder(order) && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleConfirmOrder(order.orderId)}
                            disabled={processingOrderId === order.orderId}
                            title="Confirm Order"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRejectOrder(order.orderId)}
                            disabled={processingOrderId === order.orderId}
                            title="Reject Order"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      {canUpdateOrder(order) && onUpdateOrderClick && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUpdateOrderClick(order)}
                          disabled={processingOrderId === order.orderId}
                          title="Update Order"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                      {canCancelOrder(order) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelOrder(order.orderId)}
                          disabled={processingOrderId === order.orderId}
                          title="Cancel Order"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
