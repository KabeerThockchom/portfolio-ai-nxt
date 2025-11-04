"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { usePortfolioApi } from "@/hooks/use-portfolio-api"
import type { Order } from "@/types/portfolio"

interface OrderUpdateFormProps {
  order: Order
  onSuccess?: () => void
  onCancel?: () => void
}

export function OrderUpdateForm({ order, onSuccess, onCancel }: OrderUpdateFormProps) {
  const { toast } = useToast()
  const { updateOrder } = usePortfolioApi()

  const [qty, setQty] = useState<number>(order.qty)
  const [orderType, setOrderType] = useState<string>(order.orderType)
  const [limitPrice, setLimitPrice] = useState<number | undefined>(order.limitPrice || undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset limit price when switching to Market Open
  useEffect(() => {
    if (orderType === "Market Open") {
      setLimitPrice(undefined)
    }
  }, [orderType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Build update request with only changed fields
      const updateRequest: any = {
        orderId: order.orderId,
      }

      if (qty !== order.qty) {
        updateRequest.qty = qty
      }

      if (orderType !== order.orderType) {
        updateRequest.orderType = orderType
      }

      if (orderType === "Limit" && limitPrice !== order.limitPrice) {
        updateRequest.limitPrice = limitPrice
      }

      // Check if any fields changed
      if (Object.keys(updateRequest).length === 1) {
        toast({
          title: "No Changes",
          description: "No fields were modified",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const result = await updateOrder(updateRequest)

      if (result.success) {
        toast({
          title: "Order Updated",
          description: result.data?.message || "Order has been updated successfully",
        })

        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update order",
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
      setIsSubmitting(false)
    }
  }

  const estimatedAmount = qty * order.unitPrice

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Order #{order.orderId}</CardTitle>
        <CardDescription>
          Modify order details before confirmation. {order.buySell} {order.symbol} at ${order.unitPrice.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="qty">Quantity</Label>
            <Input
              id="qty"
              type="number"
              value={qty}
              onChange={(e) => setQty(parseFloat(e.target.value))}
              min={0.01}
              step={0.01}
              required
            />
            <p className="text-xs text-muted-foreground">
              Original: {order.qty.toFixed(2)} shares
            </p>
          </div>

          {/* Order Type */}
          <div className="space-y-2">
            <Label htmlFor="orderType">Order Type</Label>
            <Select value={orderType} onValueChange={setOrderType}>
              <SelectTrigger id="orderType">
                <SelectValue placeholder="Select order type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Market Open">Market Open</SelectItem>
                <SelectItem value="Limit">Limit</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Original: {order.orderType}
            </p>
          </div>

          {/* Limit Price (only for Limit orders) */}
          {orderType === "Limit" && (
            <div className="space-y-2">
              <Label htmlFor="limitPrice">Limit Price</Label>
              <Input
                id="limitPrice"
                type="number"
                value={limitPrice || ""}
                onChange={(e) => setLimitPrice(parseFloat(e.target.value))}
                min={0.01}
                step={0.01}
                required
                placeholder="Enter limit price"
              />
              {order.limitPrice && (
                <p className="text-xs text-muted-foreground">
                  Original: ${order.limitPrice.toFixed(2)}
                </p>
              )}
            </div>
          )}

          {/* Estimated Amount */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Estimated Total:</span>
              <span className="text-lg font-bold">
                ${estimatedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Original: ${order.amount.toFixed(2)}
              {estimatedAmount !== order.amount && (
                <span className={estimatedAmount > order.amount ? " text-red-600" : " text-green-600"}>
                  {" "}({estimatedAmount > order.amount ? "+" : ""}${(estimatedAmount - order.amount).toFixed(2)})
                </span>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
              style={{ backgroundColor: "#FFE600", color: "#333333" }}
            >
              {isSubmitting ? "Updating..." : "Update Order"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
