import { useState } from "react"
import type { PortfolioHolding } from "@/types/portfolio"

/**
 * Custom hook for managing portfolio holdings state
 * Follows the pattern of use-stock-data.ts
 */
export function usePortfolioData() {
  // Portfolio holdings
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [totalValue, setTotalValue] = useState<number>(0)
  const [totalGainLoss, setTotalGainLoss] = useState<number>(0)
  const [totalGainLossPercent, setTotalGainLossPercent] = useState<number>(0)

  // Cash balance
  const [cashBalance, setCashBalance] = useState<number>(0)
  const [totalPortfolioValue, setTotalPortfolioValue] = useState<number>(0)
  const [totalInvested, setTotalInvested] = useState<number>(0)

  // Loading states
  const [isLoadingHoldings, setIsLoadingHoldings] = useState<boolean>(false)
  const [isLoadingCash, setIsLoadingCash] = useState<boolean>(false)

  // Clear all portfolio data
  const clearPortfolioData = () => {
    setHoldings([])
    setTotalValue(0)
    setTotalGainLoss(0)
    setTotalGainLossPercent(0)
    setCashBalance(0)
    setTotalPortfolioValue(0)
    setTotalInvested(0)
  }

  return {
    // Holdings state
    holdings,
    setHoldings,
    totalValue,
    setTotalValue,
    totalGainLoss,
    setTotalGainLoss,
    totalGainLossPercent,
    setTotalGainLossPercent,

    // Cash balance state
    cashBalance,
    setCashBalance,
    totalPortfolioValue,
    setTotalPortfolioValue,
    totalInvested,
    setTotalInvested,

    // Loading states
    isLoadingHoldings,
    setIsLoadingHoldings,
    isLoadingCash,
    setIsLoadingCash,

    // Actions
    clearPortfolioData,
  }
}
