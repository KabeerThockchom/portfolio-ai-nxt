"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { OrderPreview } from "@/types/portfolio"
import { AlertCircle, CheckCircle2, X } from "lucide-react"

interface OrderSlipCardProps {
  orderPreview: OrderPreview
  onConfirm?: (orderId: number) => void
  onReject?: (orderId: number) => void
}

export function OrderSlipCard({ orderPreview, onConfirm, onReject }: OrderSlipCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const isBuy = orderPreview.buySell === "Buy"

  return (
    <Card className="border-2 border-orange-500/50 bg-orange-50/10 dark:bg-orange-950/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            <CardTitle>Pending Confirmation</CardTitle>
          </div>
          <Badge
            variant="outline"
            className="text-sm font-semibold border-orange-500 text-orange-500"
          >
            PENDING
          </Badge>
        </div>
        <CardDescription>
          Order #{orderPreview.orderId} - Please confirm or reject this {orderPreview.buySell.toLowerCase()} order
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Symbol</p>
            <p className="text-xl font-bold">{orderPreview.symbol}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Quantity</p>
            <p className="text-xl font-bold">{orderPreview.quantity} shares</p>
          </div>
        </div>

        <Separator />

        {/* Price Information */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Estimated Price per Share</span>
            <span className="font-medium">{formatCurrency(orderPreview.estimatedPrice)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Estimated Total</span>
            <span className="text-lg font-bold">{formatCurrency(orderPreview.estimatedTotal)}</span>
          </div>
        </div>

        <Separator />

        {/* Account Information */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Account</span>
            <span className="font-medium">{orderPreview.accountName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Balance Before</span>
            <span className="font-medium">{formatCurrency(orderPreview.accountBalance)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Balance After</span>
            <span className={`font-bold ${
              isBuy ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"
            }`}>
              {formatCurrency(orderPreview.balanceAfterTrade)}
              <span className="text-xs ml-1">
                ({isBuy ? "-" : "+"}{formatCurrency(Math.abs(orderPreview.estimatedTotal))})
              </span>
            </span>
          </div>
        </div>

        <Separator />

        {/* Important Notice */}
        <div className="bg-orange-100/50 dark:bg-orange-900/20 rounded-lg p-3 text-sm border border-orange-200 dark:border-orange-800">
          <p className="font-medium text-orange-900 dark:text-orange-100">
            <strong>⚠️ Action Required:</strong> This {orderPreview.buySell.toLowerCase()} order is pending your confirmation.
            {isBuy
              ? ` Confirming will deduct ${formatCurrency(orderPreview.estimatedTotal)} from your account.`
              : ` Confirming will add ${formatCurrency(orderPreview.estimatedTotal)} to your account.`
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {onConfirm && (
            <Button
              onClick={() => onConfirm(orderPreview.orderId)}
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm Order
            </Button>
          )}
          {onReject && (
            <Button
              variant="destructive"
              onClick={() => onReject(orderPreview.orderId)}
              className="flex-1 gap-2"
            >
              <X className="h-4 w-4" />
              Reject Order
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
