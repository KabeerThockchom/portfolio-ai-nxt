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
import { DollarSign, Loader2 } from "lucide-react"

interface DepositDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: Account[]
  selectedAccountId?: number
  onDeposit: (accountId: number, amount: number, description?: string) => Promise<void>
  isProcessing?: boolean
}

export function DepositDialog({
  open,
  onOpenChange,
  accounts,
  selectedAccountId: initialAccountId,
  onDeposit,
  isProcessing = false,
}: DepositDialogProps) {
  const [accountId, setAccountId] = useState<number | undefined>(initialAccountId)
  const [amount, setAmount] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [error, setError] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!accountId) {
      setError("Please select an account")
      return
    }

    const depositAmount = parseFloat(amount)
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError("Please enter a valid amount greater than 0")
      return
    }

    try {
      await onDeposit(accountId, depositAmount, description || undefined)
      // Reset form on success
      setAmount("")
      setDescription("")
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Failed to process deposit")
    }
  }

  const formatCurrency = (value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return ""
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Deposit Funds
          </DialogTitle>
          <DialogDescription>
            Add cash to your account. Funds will be available immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account">Account</Label>
            <AccountSelector
              accounts={accounts}
              selectedAccountId={accountId}
              onAccountChange={setAccountId}
              placeholder="Select account to deposit into"
            />
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
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
                disabled={isProcessing}
              />
            </div>
            {amount && !isNaN(parseFloat(amount)) && (
              <p className="text-sm text-muted-foreground">
                Deposit amount: {formatCurrency(amount)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., Monthly savings, Transfer from bank, etc."
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
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Deposit Funds
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
