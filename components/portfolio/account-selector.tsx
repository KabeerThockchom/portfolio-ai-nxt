"use client"

import { Account } from "@/types/portfolio"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DollarSign } from "lucide-react"

interface AccountSelectorProps {
  accounts: Account[]
  selectedAccountId?: number
  onAccountChange: (accountId: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function AccountSelector({
  accounts,
  selectedAccountId,
  onAccountChange,
  placeholder = "Select an account",
  disabled = false,
  className,
}: AccountSelectorProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatAccountType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <Select
      value={selectedAccountId?.toString()}
      onValueChange={(value) => onAccountChange(parseInt(value))}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account.accountId} value={account.accountId.toString()}>
            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex flex-col">
                <span className="font-medium">{account.accountName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatAccountType(account.accountType)}
                  {account.isDefault && " • Default"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold">
                <DollarSign className="h-3 w-3" />
                <span>{formatCurrency(account.cashBalance)}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
