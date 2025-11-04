"use client"

import { useState } from "react"
import { Account } from "@/types/portfolio"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AccountSelector } from "./account-selector"
import { DollarSign, Loader2, AlertTriangle } from "lucide-react"

interface WithdrawDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: Account[]
  selectedAccountId?: number
  onWithdraw: (accountId: number, amount: number, description?: string) => Promise<void>
  isProcessing?: boolean
}

export function WithdrawDialog({
  open,
  onOpenChange,
  accounts,
  selectedAccountId: initialAccountId,
  onWithdraw,
  isProcessing = false,
}: WithdrawDialogProps) {
  const [accountId, setAccountId] = useState<number | undefined>(initialAccountId)
  const [amount, setAmount] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [error, setError] = useState<string>("")

  const selectedAccount = accounts.find((acc) => acc.accountId === accountId)
  const availableBalance = selectedAccount?.cashBalance || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!accountId) {
      setError("Please select an account")
      return
    }

    const withdrawAmount = parseFloat(amount)
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError("Please enter a valid amount greater than 0")
      return
    }

    if (withdrawAmount > availableBalance) {
      setError(
        `Insufficient funds. Available balance: ${formatCurrency(availableBalance)}`
      )
      return
    }

    try {
      await onWithdraw(accountId, withdrawAmount, description || undefined)
      // Reset form on success
      setAmount("")
      setDescription("")
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Failed to process withdrawal")
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const withdrawAmount = parseFloat(amount)
  const balanceAfterWithdrawal =
    !isNaN(withdrawAmount) && withdrawAmount > 0
      ? availableBalance - withdrawAmount
      : availableBalance

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-500" />
            Withdraw Funds
          </DialogTitle>
          <DialogDescription>
            Withdraw cash from your account. Funds will be deducted immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account">Account</Label>
            <AccountSelector
              accounts={accounts}
              selectedAccountId={accountId}
              onAccountChange={setAccountId}
              placeholder="Select account to withdraw from"
            />
            {selectedAccount && (
              <p className="text-sm text-muted-foreground">
                Available balance: {formatCurrency(availableBalance)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={availableBalance}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
                disabled={isProcessing || !selectedAccount}
              />
            </div>
            {amount && !isNaN(withdrawAmount) && withdrawAmount > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Withdrawal amount: {formatCurrency(withdrawAmount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Balance after withdrawal: {formatCurrency(balanceAfterWithdrawal)}
                </p>
                {balanceAfterWithdrawal < 0 && (
                  <p className="flex items-center gap-1 text-sm text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    Insufficient funds
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., Transfer to bank, Emergency expense, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isProcessing}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isProcessing || !selectedAccount || balanceAfterWithdrawal < 0}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Withdraw Funds
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
