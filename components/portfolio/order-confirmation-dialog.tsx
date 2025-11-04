"use client"

import { OrderPreview } from "@/types/portfolio"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Check, X, Loader2, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface OrderConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderPreview: OrderPreview | null
  onConfirm: (orderId: number) => Promise<void>
  onReject: (orderId: number) => Promise<void>
  isProcessing?: boolean
}

export function OrderConfirmationDialog({
  open,
  onOpenChange,
  orderPreview,
  onConfirm,
  onReject,
  isProcessing = false,
}: OrderConfirmationDialogProps) {
  if (!orderPreview) return null

  const isBuy = orderPreview.buySell === "Buy"
  const balanceChange = isBuy
    ? -orderPreview.estimatedTotal
    : orderPreview.estimatedTotal

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handleConfirm = async () => {
    try {
      await onConfirm(orderPreview.orderId)
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in parent component
    }
  }

  const handleReject = async () => {
    try {
      await onReject(orderPreview.orderId)
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in parent component
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBuy ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            Confirm {orderPreview.buySell} Order
          </DialogTitle>
          <DialogDescription>
            Please review your order details carefully before confirming. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Details */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Symbol</span>
              <span className="text-lg font-bold">{orderPreview.symbol}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Action</span>
              <Badge variant={isBuy ? "default" : "destructive"} className="text-sm">
                {orderPreview.buySell}
              </Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Quantity</span>
              <span className="text-sm font-semibold">
                {orderPreview.quantity.toLocaleString()} shares
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Estimated Price
              </span>
              <span className="text-sm font-semibold">
                {formatCurrency(orderPreview.estimatedPrice)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Estimated Total
              </span>
              <span className="text-lg font-bold">
                {formatCurrency(orderPreview.estimatedTotal)}
              </span>
            </div>
          </div>

          {/* Account Impact */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-900 dark:text-amber-100">
              <DollarSign className="h-4 w-4" />
              Account Impact
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account</span>
                <span className="font-medium">{orderPreview.accountName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Balance</span>
                <span className="font-medium">
                  {formatCurrency(orderPreview.accountBalance)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Balance Change</span>
                <span
                  className={`font-semibold ${
                    balanceChange > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {balanceChange > 0 ? "+" : ""}
                  {formatCurrency(balanceChange)}
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-medium">New Balance</span>
                <span className="font-bold text-base">
                  {formatCurrency(orderPreview.balanceAfterTrade)}
                </span>
              </div>
            </div>
          </div>

          {/* Warning for low balance */}
          {orderPreview.balanceAfterTrade < 1000 && isBuy && (
            <div className="rounded-md bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800 p-3">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <strong>Note:</strong> Your account balance will be low after this transaction.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleReject}
            disabled={isProcessing}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Reject Order
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="gap-2"
            variant={isBuy ? "default" : "destructive"}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Confirm {orderPreview.buySell}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
