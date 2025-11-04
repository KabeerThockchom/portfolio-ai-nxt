"use client"

import { useState } from "react"
import { Transaction } from "@/types/portfolio"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, TrendingDown } from "lucide-react"
import { format } from "date-fns"

interface TransactionHistoryTableProps {
  transactions: Transaction[]
  summary?: {
    totalDeposits: number
    totalWithdrawals: number
    totalBuys: number
    totalSells: number
  }
  isLoading?: boolean
}

export function TransactionHistoryTable({
  transactions,
  summary,
  isLoading = false,
}: TransactionHistoryTableProps) {
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm")
    } catch {
      return dateString
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return <ArrowDownCircle className="h-4 w-4 text-green-500" />
      case "WITHDRAW":
        return <ArrowUpCircle className="h-4 w-4 text-orange-500" />
      case "BUY":
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case "SELL":
        return <TrendingDown className="h-4 w-4 text-purple-500" />
      default:
        return null
    }
  }

  const getTransactionBadgeVariant = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return "default"
      case "WITHDRAW":
        return "secondary"
      case "BUY":
        return "outline"
      case "SELL":
        return "destructive"
      default:
        return "outline"
    }
  }

  const filteredTransactions =
    typeFilter === "all"
      ? transactions
      : transactions.filter((t) => t.transType === typeFilter)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Loading transactions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="DEPOSIT">Deposits</SelectItem>
              <SelectItem value="WITHDRAW">Withdrawals</SelectItem>
              <SelectItem value="BUY">Buys</SelectItem>
              <SelectItem value="SELL">Sells</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowDownCircle className="h-4 w-4 text-green-500" />
                Deposits
              </div>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(summary.totalDeposits)}
              </p>
            </div>
            <div className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowUpCircle className="h-4 w-4 text-orange-500" />
                Withdrawals
              </div>
              <p className="text-lg font-bold text-orange-600">
                {formatCurrency(summary.totalWithdrawals)}
              </p>
            </div>
            <div className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Buys
              </div>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(summary.totalBuys)}
              </p>
            </div>
            <div className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingDown className="h-4 w-4 text-purple-500" />
                Sells
              </div>
              <p className="text-lg font-bold text-purple-600">
                {formatCurrency(summary.totalSells)}
              </p>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground h-32">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.transId}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getTransactionBadgeVariant(transaction.transType)}
                        className="gap-1"
                      >
                        {getTransactionIcon(transaction.transType)}
                        {transaction.transType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {transaction.accountName || "N/A"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {transaction.accountType || ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.assetTicker ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{transaction.assetTicker}</span>
                          <span className="text-xs text-muted-foreground">
                            {transaction.assetName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.units != null ? (
                        <span className="font-medium">{transaction.units.toLocaleString()}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.pricePerUnit != null ? (
                        formatCurrency(transaction.pricePerUnit)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-semibold ${
                          transaction.transType === "DEPOSIT" ||
                          transaction.transType === "SELL"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.transType === "DEPOSIT" ||
                        transaction.transType === "SELL"
                          ? "+"
                          : "-"}
                        {formatCurrency(Math.abs(transaction.cost))}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {transaction.description || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
