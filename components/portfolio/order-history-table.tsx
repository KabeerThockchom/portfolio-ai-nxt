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
import { X } from "lucide-react"

interface OrderHistoryTableProps {
  orders: Order[]
  userId: number
  onOrderCancelled?: () => void
}

export function OrderHistoryTable({ orders, userId, onOrderCancelled }: OrderHistoryTableProps) {
  const { toast } = useToast()
  const { cancelOrder } = usePortfolioApi()
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null)

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
        return <Badge variant="destructive">Cancelled</Badge>
      case "Executed":
        return <Badge style={{ backgroundColor: "#FFE600", color: "#333333" }}>Executed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    setCancellingOrderId(orderId)

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
      setCancellingOrderId(null)
    }
  }

  const canCancelOrder = (order: Order) => {
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
              <TableHead>Type</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="font-mono text-sm">#{order.orderId}</TableCell>
                  <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
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
                    {canCancelOrder(order) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelOrder(order.orderId)}
                        disabled={cancellingOrderId === order.orderId}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
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
