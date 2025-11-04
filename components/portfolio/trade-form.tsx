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
import { AccountSelector } from "./account-selector"
import type { PlaceOrderRequest, Account, OrderPreview } from "@/types/portfolio"
import { DollarSign, TrendingUp, AlertTriangle } from "lucide-react"

interface TradeFormProps {
  userId: number
  accounts: Account[]
  selectedAccountId?: number
  onAccountChange?: (accountId: number) => void
  onOrderPreview?: (orderPreview: OrderPreview) => void
  onOrderPlaced?: () => void
}

export function TradeForm({
  userId,
  accounts,
  selectedAccountId: initialAccountId,
  onAccountChange,
  onOrderPreview,
  onOrderPlaced,
}: TradeFormProps) {
  const { toast } = useToast()
  const { placeOrder } = usePortfolioApi()

  const [accountId, setAccountId] = useState<number | undefined>(initialAccountId)
  const [symbol, setSymbol] = useState("")
  const [buySell, setBuySell] = useState<"Buy" | "Sell">("Buy")
  const [orderType, setOrderType] = useState<"Market Open" | "Limit">("Market Open")
  const [qty, setQty] = useState("")
  const [price, setPrice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedAccount = accounts.find((acc) => acc.accountId === accountId)
  const accountBalance = selectedAccount?.cashBalance || 0

  const handleAccountChange = (newAccountId: number) => {
    setAccountId(newAccountId)
    if (onAccountChange) {
      onAccountChange(newAccountId)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!accountId) {
      toast({
        title: "Validation Error",
        description: "Please select an account",
        variant: "destructive",
      })
      return
    }

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
        accountId,
        symbol: symbol.toUpperCase(),
        buySell,
        orderType,
        qty: qtyNum,
        price: priceNum,
      }

      const result = await placeOrder(request)

      if (result.success && result.data?.orderPreview) {
        // Show order preview dialog instead of placing immediately
        if (onOrderPreview) {
          onOrderPreview(result.data.orderPreview)
        }

        // Reset form
        setSymbol("")
        setQty("")
        setPrice("")
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

  const estimatedTotal =
    qty && (orderType === "Market Open" || price)
      ? (parseFloat(qty) || 0) * (parseFloat(price) || 100)
      : 0

  const insufficientFunds = buySell === "Buy" && estimatedTotal > accountBalance

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Place Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Selection */}
          <div className="space-y-2">
            <Label htmlFor="account">Trading Account *</Label>
            <AccountSelector
              accounts={accounts}
              selectedAccountId={accountId}
              onAccountChange={handleAccountChange}
              placeholder="Select account for this trade"
            />
            {selectedAccount && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Available:</span>
                <Badge variant="outline" className="font-mono">
                  ${accountBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Badge>
              </div>
            )}
          </div>

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
              disabled={!accountId}
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
          {estimatedTotal > 0 && (
            <div className={`p-3 rounded-md ${insufficientFunds ? "bg-destructive/15 border border-destructive" : "bg-muted"}`}>
              <p className="text-sm text-muted-foreground">Estimated Total</p>
              <p className="text-lg font-bold">
                ${estimatedTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              {insufficientFunds && (
                <div className="flex items-center gap-1 mt-2 text-sm text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Insufficient funds (need ${(estimatedTotal - accountBalance).toLocaleString()})</span>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !accountId || insufficientFunds}
            variant={buySell === "Buy" ? "default" : "destructive"}
          >
            {isSubmitting ? "Preparing Order..." : `Review ${buySell} Order`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
