import { useState } from "react"
import type { Account, Transaction, OrderPreview } from "@/types/portfolio"

/**
 * Custom hook for managing account state
 * Follows the pattern of use-portfolio-data.ts
 */
export function useAccounts() {
  // Account list
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [totalCash, setTotalCash] = useState<number>(0)

  // Transaction history
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionSummary, setTransactionSummary] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalBuys: 0,
    totalSells: 0,
  })

  // Order confirmation
  const [pendingOrder, setPendingOrder] = useState<OrderPreview | null>(null)
  const [showOrderConfirmation, setShowOrderConfirmation] = useState<boolean>(false)

  // Loading states
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(false)
  const [isProcessingDeposit, setIsProcessingDeposit] = useState<boolean>(false)
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState<boolean>(false)
  const [isConfirmingOrder, setIsConfirmingOrder] = useState<boolean>(false)

  // Clear all account data
  const clearAccountData = () => {
    setAccounts([])
    setSelectedAccount(null)
    setTotalCash(0)
    setTransactions([])
    setTransactionSummary({
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalBuys: 0,
      totalSells: 0,
    })
    setPendingOrder(null)
    setShowOrderConfirmation(false)
  }

  // Helper to get account by ID
  const getAccountById = (accountId: number): Account | undefined => {
    return accounts.find((acc) => acc.accountId === accountId)
  }

  // Helper to get default account
  const getDefaultAccount = (): Account | undefined => {
    return accounts.find((acc) => acc.isDefault)
  }

  return {
    // Account state
    accounts,
    setAccounts,
    selectedAccount,
    setSelectedAccount,
    totalCash,
    setTotalCash,

    // Transaction state
    transactions,
    setTransactions,
    transactionSummary,
    setTransactionSummary,

    // Order confirmation state
    pendingOrder,
    setPendingOrder,
    showOrderConfirmation,
    setShowOrderConfirmation,

    // Loading states
    isLoadingAccounts,
    setIsLoadingAccounts,
    isLoadingTransactions,
    setIsLoadingTransactions,
    isProcessingDeposit,
    setIsProcessingDeposit,
    isProcessingWithdrawal,
    setIsProcessingWithdrawal,
    isConfirmingOrder,
    setIsConfirmingOrder,

    // Actions
    clearAccountData,
    getAccountById,
    getDefaultAccount,
  }
}
