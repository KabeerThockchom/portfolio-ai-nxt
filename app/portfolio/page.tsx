"use client"

import React, { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

// Portfolio components
import { PortfolioSummaryCard } from "@/components/portfolio/portfolio-summary-card"
import { HoldingsTable } from "@/components/portfolio/holdings-table"
import { DonutChart } from "@/components/portfolio/donut-chart"
import { BubbleChart } from "@/components/portfolio/bubble-chart"
import { GaugeChart } from "@/components/portfolio/gauge-chart"
import { BenchmarkChart } from "@/components/portfolio/benchmark-chart"
import { WaterfallChart } from "@/components/portfolio/waterfall-chart"
import { TradeForm } from "@/components/portfolio/trade-form"
import { OrderHistoryTable } from "@/components/portfolio/order-history-table"

// Hooks
import { usePortfolioData } from "@/hooks/use-portfolio-data"
import { usePortfolioAnalysis } from "@/hooks/use-portfolio-analysis"
import { useOrders } from "@/hooks/use-orders"
import { usePortfolioApi } from "@/hooks/use-portfolio-api"
import { useToast } from "@/hooks/use-toast"

export default function PortfolioPage() {
  const { toast } = useToast()
  const portfolioApi = usePortfolioApi()

  // State hooks
  const portfolioData = usePortfolioData()
  const portfolioAnalysis = usePortfolioAnalysis()
  const ordersData = useOrders()

  // Default user ID (in production, this would come from auth)
  const [userId] = useState(1)

  // Load portfolio data on mount
  useEffect(() => {
    loadPortfolioData()
    loadCashBalance()
    loadOrderHistory()
  }, [])

  const loadPortfolioData = async () => {
    portfolioData.setIsLoadingHoldings(true)

    try {
      const result = await portfolioApi.fetchPortfolioHoldings(userId)

      if (result.success && result.data) {
        portfolioData.setHoldings(result.data.holdings)
        portfolioData.setTotalValue(result.data.totalValue)
        portfolioData.setTotalGainLoss(result.data.totalGainLoss)
        portfolioData.setTotalGainLossPercent(result.data.totalGainLossPercent)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load portfolio holdings",
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
      portfolioData.setIsLoadingHoldings(false)
    }
  }

  const loadCashBalance = async () => {
    portfolioData.setIsLoadingCash(true)

    try {
      const result = await portfolioApi.fetchCashBalance(userId)

      if (result.success && result.data) {
        portfolioData.setCashBalance(result.data.cashBalance)
        portfolioData.setTotalPortfolioValue(result.data.totalPortfolioValue)
        portfolioData.setTotalInvested(result.data.totalInvested)
      }
    } catch (error) {
      console.error("Error loading cash balance:", error)
    } finally {
      portfolioData.setIsLoadingCash(false)
    }
  }

  const loadAggregation = async (dimension: string, metric: string) => {
    portfolioAnalysis.setIsLoadingAggregation(true)

    try {
      const result = await portfolioApi.fetchPortfolioAggregation({
        userId,
        dimension: dimension as any,
        metric: metric as any,
      })

      if (result.success && result.data) {
        portfolioAnalysis.setAggregationData(result.data.aggregation)
        portfolioAnalysis.setAggregationChartData(result.data.chartData)
        portfolioAnalysis.setAggregationDimension(dimension)
      }
    } catch (error) {
      console.error("Error loading aggregation:", error)
    } finally {
      portfolioAnalysis.setIsLoadingAggregation(false)
    }
  }

  const loadRiskAnalysis = async () => {
    portfolioAnalysis.setIsLoadingRisk(true)

    try {
      const result = await portfolioApi.fetchPortfolioRisk({
        userId,
        dimension: "asset_class",
      })

      if (result.success && result.data) {
        portfolioAnalysis.setRiskAnalysis(result.data.analysis)
        portfolioAnalysis.setOverallRiskScore(result.data.overallRiskScore)
        portfolioAnalysis.setRiskBubbleData(result.data.chartData.bubbleData)
        portfolioAnalysis.setRiskGaugeData(result.data.chartData.gaugeData)
      }
    } catch (error) {
      console.error("Error loading risk analysis:", error)
    } finally {
      portfolioAnalysis.setIsLoadingRisk(false)
    }
  }

  const loadOrderHistory = async () => {
    ordersData.setIsLoadingOrders(true)

    try {
      const result = await portfolioApi.fetchOrderHistory(userId)

      if (result.success && result.data) {
        ordersData.setOrders(result.data.orders)
      }
    } catch (error) {
      console.error("Error loading order history:", error)
    } finally {
      ordersData.setIsLoadingOrders(false)
    }
  }

  const handleRefresh = () => {
    loadPortfolioData()
    loadCashBalance()
    loadOrderHistory()
    toast({
      title: "Refreshed",
      description: "Portfolio data has been refreshed",
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your investments and track performance
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <PortfolioSummaryCard
        totalValue={portfolioData.totalValue}
        cashBalance={portfolioData.cashBalance}
        totalGainLoss={portfolioData.totalGainLoss}
        totalGainLossPercent={portfolioData.totalGainLossPercent}
        overallRiskScore={portfolioAnalysis.overallRiskScore}
      />

      {/* Main Tabs */}
      <Tabs defaultValue="holdings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
        </TabsList>

        {/* Holdings Tab */}
        <TabsContent value="holdings" className="space-y-4">
          <HoldingsTable
            holdings={portfolioData.holdings}
            totalValue={portfolioData.totalValue}
            totalGainLoss={portfolioData.totalGainLoss}
            totalGainLossPercent={portfolioData.totalGainLossPercent}
          />
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Asset Class Distribution */}
            <div>
              <Button
                onClick={() => loadAggregation("asset_class", "total_value")}
                variant="outline"
                size="sm"
                className="mb-2"
              >
                Load Asset Class Distribution
              </Button>
              {portfolioAnalysis.aggregationChartData && (
                <DonutChart
                  data={portfolioAnalysis.aggregationChartData}
                  title="Portfolio by Asset Class"
                  subtitle="Distribution of your investments"
                />
              )}
            </div>

            {/* Risk Score Gauge */}
            <div>
              <Button
                onClick={loadRiskAnalysis}
                variant="outline"
                size="sm"
                className="mb-2"
              >
                Load Risk Analysis
              </Button>
              {portfolioAnalysis.riskGaugeData && (
                <GaugeChart
                  data={portfolioAnalysis.riskGaugeData}
                  title="Portfolio Risk Score"
                  subtitle="Overall risk assessment"
                />
              )}
            </div>
          </div>

          {/* Risk Bubble Chart */}
          {portfolioAnalysis.riskBubbleData && portfolioAnalysis.riskBubbleData.length > 0 && (
            <BubbleChart
              data={portfolioAnalysis.riskBubbleData}
              title="Risk Analysis by Asset Class"
              subtitle="Bubble size represents risk level"
            />
          )}
        </TabsContent>

        {/* Trading Tab */}
        <TabsContent value="trading" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Trade Form */}
            <TradeForm
              userId={userId}
              cashBalance={portfolioData.cashBalance}
              onOrderPlaced={() => {
                loadOrderHistory()
                loadCashBalance()
              }}
            />

            {/* Order History */}
            <div className="md:col-span-2">
              <OrderHistoryTable
                orders={ordersData.orders}
                userId={userId}
                onOrderCancelled={loadOrderHistory}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
