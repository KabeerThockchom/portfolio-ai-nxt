"use client"

import React, { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, DollarSign, ArrowDownCircle, ArrowUpCircle } from "lucide-react"

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
import { DepositDialog } from "@/components/portfolio/deposit-dialog"
import { WithdrawDialog } from "@/components/portfolio/withdraw-dialog"
import { OrderConfirmationDialog } from "@/components/portfolio/order-confirmation-dialog"
import { TransactionHistoryTable } from "@/components/portfolio/transaction-history-table"

// Hooks
import { usePortfolioData } from "@/hooks/use-portfolio-data"
import { usePortfolioAnalysis } from "@/hooks/use-portfolio-analysis"
import { useOrders } from "@/hooks/use-orders"
import { useAccounts } from "@/hooks/use-accounts"
import { usePortfolioApi } from "@/hooks/use-portfolio-api"
import { useToast } from "@/hooks/use-toast"

export default function PortfolioPage() {
  const { toast } = useToast()
  const portfolioApi = usePortfolioApi()

  // State hooks
  const portfolioData = usePortfolioData()
  const portfolioAnalysis = usePortfolioAnalysis()
  const ordersData = useOrders()
  const accountsData = useAccounts()

  // Default user ID (in production, this would come from auth)
  const [userId] = useState(1)

  // Dialog states
  const [showDepositDialog, setShowDepositDialog] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)

  // Load portfolio data on mount
  useEffect(() => {
    loadPortfolioData()
    loadAccounts()
    loadOrderHistory()
    loadTransactionHistory()
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

  const loadAccounts = async () => {
    accountsData.setIsLoadingAccounts(true)

    try {
      const result = await portfolioApi.fetchAccountList(userId)

      if (result.success && result.data) {
        accountsData.setAccounts(result.data.accounts)
        accountsData.setTotalCash(result.data.totalCash)

        // Set default account as selected if none selected
        if (!accountsData.selectedAccount && result.data.accounts.length > 0) {
          const defaultAccount = result.data.accounts.find((acc) => acc.isDefault)
          accountsData.setSelectedAccount(defaultAccount || result.data.accounts[0])
        }
      }
    } catch (error) {
      console.error("Error loading accounts:", error)
    } finally {
      accountsData.setIsLoadingAccounts(false)
    }
  }

  const loadTransactionHistory = async () => {
    accountsData.setIsLoadingTransactions(true)

    try {
      const result = await portfolioApi.fetchTransactionHistory(userId)

      if (result.success && result.data) {
        accountsData.setTransactions(result.data.transactions)
        accountsData.setTransactionSummary(result.data.summary)
      }
    } catch (error) {
      console.error("Error loading transaction history:", error)
    } finally {
      accountsData.setIsLoadingTransactions(false)
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

  const loadSectorAggregation = async () => {
    portfolioAnalysis.setIsLoadingSector(true)

    try {
      const result = await portfolioApi.fetchPortfolioAggregation({
        userId,
        dimension: "sector",
        metric: "total_value",
      })

      if (result.success && result.data) {
        portfolioAnalysis.setSectorChartData(result.data.chartData)
      }
    } catch (error) {
      console.error("Error loading sector aggregation:", error)
    } finally {
      portfolioAnalysis.setIsLoadingSector(false)
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

  const handleDeposit = async (accountId: number, amount: number, description?: string) => {
    accountsData.setIsProcessingDeposit(true)

    try {
      const result = await portfolioApi.depositFunds({ accountId, amount, description })

      if (result.success) {
        toast({
          title: "Deposit Successful",
          description: `Deposited $${amount.toLocaleString()} to ${result.data?.accountName}`,
        })
        await loadAccounts()
        await loadTransactionHistory()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to process deposit",
        variant: "destructive",
      })
      throw error
    } finally {
      accountsData.setIsProcessingDeposit(false)
    }
  }

  const handleWithdraw = async (accountId: number, amount: number, description?: string) => {
    accountsData.setIsProcessingWithdrawal(true)

    try {
      const result = await portfolioApi.withdrawFunds({ accountId, amount, description })

      if (result.success) {
        toast({
          title: "Withdrawal Successful",
          description: `Withdrew $${amount.toLocaleString()} from ${result.data?.accountName}`,
        })
        await loadAccounts()
        await loadTransactionHistory()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      })
      throw error
    } finally {
      accountsData.setIsProcessingWithdrawal(false)
    }
  }

  const handleConfirmOrder = async (orderId: number) => {
    accountsData.setIsConfirmingOrder(true)

    try {
      const result = await portfolioApi.confirmOrder({ orderId })

      if (result.success) {
        toast({
          title: "Order Confirmed",
          description: result.data?.message || "Order has been executed successfully",
        })
        await loadAccounts()
        await loadPortfolioData()
        await loadOrderHistory()
        await loadTransactionHistory()
        accountsData.setShowOrderConfirmation(false)
        accountsData.setPendingOrder(null)
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Order Confirmation Failed",
        description: error.message || "Failed to confirm order",
        variant: "destructive",
      })
      throw error
    } finally {
      accountsData.setIsConfirmingOrder(false)
    }
  }

  const handleRejectOrder = async (orderId: number) => {
    accountsData.setIsConfirmingOrder(true)

    try {
      const result = await portfolioApi.rejectOrder({ orderId })

      if (result.success) {
        toast({
          title: "Order Rejected",
          description: result.data?.message || "Order has been cancelled",
        })
        await loadOrderHistory()
        accountsData.setShowOrderConfirmation(false)
        accountsData.setPendingOrder(null)
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Order Rejection Failed",
        description: error.message || "Failed to reject order",
        variant: "destructive",
      })
      throw error
    } finally {
      accountsData.setIsConfirmingOrder(false)
    }
  }

  const handleRefresh = () => {
    loadPortfolioData()
    loadAccounts()
    loadOrderHistory()
    loadTransactionHistory()
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
        cashBalance={accountsData.totalCash}
        totalGainLoss={portfolioData.totalGainLoss}
        totalGainLossPercent={portfolioData.totalGainLossPercent}
        overallRiskScore={portfolioAnalysis.overallRiskScore}
      />

      {/* Main Tabs */}
      <Tabs defaultValue="holdings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
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

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          {/* Account Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            {accountsData.accounts.map((account) => (
              <Card key={account.accountId}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {account.accountName}
                    {account.isDefault && (
                      <span className="text-xs font-normal text-muted-foreground">Default</span>
                    )}
                  </CardTitle>
                  <CardDescription className="capitalize">{account.accountType}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">
                        ${account.cashBalance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          accountsData.setSelectedAccount(account)
                          setShowDepositDialog(true)
                        }}
                      >
                        <ArrowDownCircle className="h-4 w-4 mr-1" />
                        Deposit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          accountsData.setSelectedAccount(account)
                          setShowWithdrawDialog(true)
                        }}
                      >
                        <ArrowUpCircle className="h-4 w-4 mr-1" />
                        Withdraw
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Transaction History */}
          <TransactionHistoryTable
            transactions={accountsData.transactions}
            summary={accountsData.transactionSummary}
            isLoading={accountsData.isLoadingTransactions}
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
                disabled={portfolioAnalysis.isLoadingAggregation}
              >
                {portfolioAnalysis.isLoadingAggregation ? "Loading..." : "Load Asset Class Distribution"}
              </Button>
              {portfolioAnalysis.aggregationChartData && (
                <DonutChart
                  data={portfolioAnalysis.aggregationChartData}
                  title="Portfolio by Asset Class"
                  subtitle="Distribution of your investments"
                />
              )}
            </div>

            {/* Sector Distribution */}
            <div>
              <Button
                onClick={loadSectorAggregation}
                variant="outline"
                size="sm"
                className="mb-2"
                disabled={portfolioAnalysis.isLoadingSector}
              >
                {portfolioAnalysis.isLoadingSector ? "Loading..." : "Load Sector Distribution"}
              </Button>
              {portfolioAnalysis.sectorChartData && (
                <DonutChart
                  data={portfolioAnalysis.sectorChartData}
                  title="Portfolio by Sector"
                  subtitle="Breakdown across market sectors"
                />
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-4">
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
              accounts={accountsData.accounts}
              selectedAccountId={accountsData.selectedAccount?.accountId}
              onAccountChange={(accountId) => {
                const account = accountsData.getAccountById(accountId)
                if (account) accountsData.setSelectedAccount(account)
              }}
              onOrderPreview={(orderPreview) => {
                accountsData.setPendingOrder(orderPreview)
                accountsData.setShowOrderConfirmation(true)
              }}
              onOrderPlaced={() => {
                loadOrderHistory()
                loadAccounts()
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

      {/* Dialogs */}
      <DepositDialog
        open={showDepositDialog}
        onOpenChange={setShowDepositDialog}
        accounts={accountsData.accounts}
        selectedAccountId={accountsData.selectedAccount?.accountId}
        onDeposit={handleDeposit}
        isProcessing={accountsData.isProcessingDeposit}
      />

      <WithdrawDialog
        open={showWithdrawDialog}
        onOpenChange={setShowWithdrawDialog}
        accounts={accountsData.accounts}
        selectedAccountId={accountsData.selectedAccount?.accountId}
        onWithdraw={handleWithdraw}
        isProcessing={accountsData.isProcessingWithdrawal}
      />

      <OrderConfirmationDialog
        open={accountsData.showOrderConfirmation}
        onOpenChange={(open) => {
          accountsData.setShowOrderConfirmation(open)
          if (!open) accountsData.setPendingOrder(null)
        }}
        orderPreview={accountsData.pendingOrder}
        onConfirm={handleConfirmOrder}
        onReject={handleRejectOrder}
        isProcessing={accountsData.isConfirmingOrder}
      />
    </div>
  )
}
