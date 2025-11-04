"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react"

interface PortfolioSummaryCardProps {
  totalValue: number
  cashBalance: number
  totalGainLoss: number
  totalGainLossPercent: number
  overallRiskScore?: number
}

export function PortfolioSummaryCard({
  totalValue,
  cashBalance,
  totalGainLoss,
  totalGainLossPercent,
  overallRiskScore,
}: PortfolioSummaryCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const getRiskLevel = (score: number) => {
    if (score <= 2) return { label: "Low", color: "text-[#FFE600]" }
    if (score <= 4) return { label: "Moderate", color: "text-[#CCCCCC]" }
    if (score <= 6) return { label: "Medium", color: "text-[#999999]" }
    if (score <= 8) return { label: "High", color: "text-[#666666]" }
    return { label: "Very High", color: "text-[#333333]" }
  }

  const riskLevel = overallRiskScore ? getRiskLevel(overallRiskScore) : null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Portfolio Value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Cash: {formatCurrency(cashBalance)}
          </p>
        </CardContent>
      </Card>

      {/* Total Gain/Loss */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
          {totalGainLoss >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(totalGainLoss)}
          </div>
          <p
            className={`text-xs mt-1 ${
              totalGainLossPercent >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {totalGainLossPercent >= 0 ? "+" : ""}
            {totalGainLossPercent.toFixed(2)}% return
          </p>
        </CardContent>
      </Card>

      {/* Overall Risk Score */}
      {overallRiskScore !== undefined && riskLevel && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <AlertCircle className={`h-4 w-4 ${riskLevel.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${riskLevel.color}`}>
              {overallRiskScore.toFixed(1)} / 10
            </div>
            <p className={`text-xs mt-1 ${riskLevel.color}`}>{riskLevel.label} Risk</p>
          </CardContent>
        </Card>
      )}

      {/* Cash Available */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cash Available</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(cashBalance)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {((cashBalance / totalValue) * 100).toFixed(1)}% of portfolio
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
