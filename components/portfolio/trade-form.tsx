"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { usePortfolioApi } from "@/hooks/use-portfolio-api"
import type { PlaceOrderRequest } from "@/types/portfolio"

interface TradeFormProps {
  userId: number
  cashBalance: number
  onOrderPlaced?: () => void
}

export function TradeForm({ userId, cashBalance, onOrderPlaced }: TradeFormProps) {
  const { toast } = useToast()
  const { placeOrder } = usePortfolioApi()

  const [symbol, setSymbol] = useState("")
  const [buySell, setBuySell] = useState<"Buy" | "Sell">("Buy")
  const [orderType, setOrderType] = useState<"Market Open" | "Limit">("Market Open")
  const [qty, setQty] = useState("")
  const [price, setPrice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!symbol || !qty) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (orderType === "Limit" && !price) {
      toast({
        title: "Validation Error",
        description: "Limit orders require a price",
        variant: "destructive",
      })
      return
    }

    const qtyNum = parseFloat(qty)
    const priceNum = price ? parseFloat(price) : undefined

    if (isNaN(qtyNum) || qtyNum <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be a positive number",
        variant: "destructive",
      })
      return
    }

    if (priceNum !== undefined && (isNaN(priceNum) || priceNum <= 0)) {
      toast({
        title: "Validation Error",
        description: "Price must be a positive number",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const request: PlaceOrderRequest = {
        userId,
        symbol: symbol.toUpperCase(),
        buySell,
        orderType,
        qty: qtyNum,
        price: priceNum,
      }

      const result = await placeOrder(request)

      if (result.success) {
        toast({
          title: "Order Placed",
          description: result.data?.message || "Your order has been placed successfully",
        })

        // Reset form
        setSymbol("")
        setQty("")
        setPrice("")

        // Notify parent component
        if (onOrderPlaced) {
          onOrderPlaced()
        }
      } else {
        toast({
          title: "Order Failed",
          description: result.error || "Failed to place order",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place Order</CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-muted-foreground">Cash Available:</span>
          <Badge variant="outline" className="font-mono">
            ${cashBalance.toLocaleString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Symbol */}
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol *</Label>
            <Input
              id="symbol"
              placeholder="AAPL"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="uppercase"
              maxLength={10}
              required
            />
          </div>

          {/* Buy/Sell */}
          <div className="space-y-2">
            <Label htmlFor="buySell">Action *</Label>
            <Select value={buySell} onValueChange={(value) => setBuySell(value as "Buy" | "Sell")}>
              <SelectTrigger id="buySell">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Buy">Buy</SelectItem>
                <SelectItem value="Sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Order Type */}
          <div className="space-y-2">
            <Label htmlFor="orderType">Order Type *</Label>
            <Select
              value={orderType}
              onValueChange={(value) => setOrderType(value as "Market Open" | "Limit")}
            >
              <SelectTrigger id="orderType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Market Open">Market Open</SelectItem>
                <SelectItem value="Limit">Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="qty">Quantity *</Label>
            <Input
              id="qty"
              type="number"
              placeholder="10"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
          </div>

          {/* Price (for Limit orders) */}
          {orderType === "Limit" && (
            <div className="space-y-2">
              <Label htmlFor="price">Limit Price *</Label>
              <Input
                id="price"
                type="number"
                placeholder="150.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0.01"
                step="0.01"
                required
              />
            </div>
          )}

          {/* Estimated Total */}
          {qty && (orderType === "Market Open" || price) && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Estimated Total</p>
              <p className="text-lg font-bold">
                ${((parseFloat(qty) || 0) * (parseFloat(price) || 100)).toLocaleString()}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Placing Order..." : `Place ${buySell} Order`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
