"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Calendar, TrendingUp, TrendingDown } from "lucide-react"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface StockIncomeStatementCardProps {
  financialsData: any
  symbol: string
}

export default function StockIncomeStatementCard({ financialsData, symbol }: StockIncomeStatementCardProps) {
  const [period, setPeriod] = useState<"annual" | "quarterly">("annual")

  if (!financialsData) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No income statement data available for {symbol}</p>
        </CardContent>
      </Card>
    )
  }

  const incomeStatementData = period === "annual"
    ? financialsData.incomeStatementHistory?.incomeStatementHistory || []
    : financialsData.incomeStatementHistoryQuarterly?.incomeStatementHistory || []

  // Check if we have actual income statement data
  const hasDetailedData = incomeStatementData.length > 0 &&
    incomeStatementData.some((item: any) =>
      item.totalRevenue || item.netIncome
    )

  // Format date
  const formatDate = (rawDate: number) => {
    const date = new Date(rawDate * 1000)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
  }

  // Format large numbers
  const formatLargeNumber = (num: number | undefined) => {
    if (!num && num !== 0) return "N/A"
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num < 0) return `-$${Math.abs(num).toLocaleString()}`
    return `$${num.toLocaleString()}`
  }

  // Calculate profit margin
  const calculateProfitMargin = (netIncome: number, revenue: number) => {
    if (!revenue || revenue === 0) return "N/A"
    return `${((netIncome / revenue) * 100).toFixed(2)}%`
  }

  // Prepare chart data for revenue and net income trends
  const prepareChartData = () => {
    if (!hasDetailedData) return null

    const dates = incomeStatementData.map((item: any) => formatDate(item.endDate?.raw)).reverse()
    const revenues = incomeStatementData.map((item: any) => item.totalRevenue?.raw || 0).reverse()
    const netIncomes = incomeStatementData.map((item: any) => item.netIncome?.raw || 0).reverse()

    return {
      series: [
        { name: "Revenue", data: revenues },
        { name: "Net Income", data: netIncomes },
      ],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: true },
          background: "transparent",
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "55%",
            borderRadius: 4,
          },
        },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ["transparent"] },
        xaxis: {
          categories: dates,
          labels: { style: { colors: "hsl(var(--muted-foreground))" } },
        },
        yaxis: {
          labels: {
            style: { colors: "hsl(var(--muted-foreground))" },
            formatter: (value: number) => {
              if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
              if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
              if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
              return `$${value.toLocaleString()}`
            },
          },
        },
        fill: { opacity: 1 },
        colors: ["#3b82f6", "#10b981"],
        legend: {
          position: "top" as const,
          labels: { colors: "hsl(var(--foreground))" },
        },
        grid: {
          borderColor: "hsl(var(--border))",
          strokeDashArray: 4,
        },
        tooltip: {
          theme: "dark",
          y: {
            formatter: (value: number) => {
              if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
              if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
              if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
              return `$${value.toLocaleString()}`
            },
          },
        },
      },
    }
  }

  const chartData = prepareChartData()

  // Calculate key metrics for the most recent period
  const mostRecentData = incomeStatementData[0]
  const profitMargin = mostRecentData
    ? calculateProfitMargin(mostRecentData.netIncome?.raw, mostRecentData.totalRevenue?.raw)
    : "N/A"

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              {symbol} - Income Statement
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Revenue, Expenses, and Profitability
            </p>
          </div>
          <select
            id="incomeStatementPeriod"
            className="px-3 py-1.5 text-sm rounded-md border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
            value={period}
            onChange={(e) => setPeriod(e.target.value as "annual" | "quarterly")}
          >
            <option value="annual">Annual</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {incomeStatementData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] border border-dashed rounded-lg border-border bg-muted/30">
            <Calendar className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm text-center">
              No {period} income statement data available for {symbol}
            </p>
          </div>
        ) : !hasDetailedData ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Available Periods</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {incomeStatementData.map((item: any, index: number) => (
                <div key={index} className="p-3 bg-muted rounded-lg border border-border text-center">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Period {index + 1}</p>
                  <p className="text-sm font-semibold text-foreground">
                    {item.endDate?.fmt || "N/A"}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Detailed income statement line items are limited from this data source.
            </p>
          </div>
        ) : (
          <>
            {/* Key Metrics Summary */}
            {mostRecentData && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Most Recent Period</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Period</p>
                    <p className="text-sm font-semibold text-foreground">
                      {mostRecentData.endDate?.fmt || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Revenue</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatLargeNumber(mostRecentData.totalRevenue?.raw)}
                    </p>
                  </div>
                  <div className={`p-3 bg-muted rounded-lg border border-border ${
                    mostRecentData.netIncome?.raw >= 0 ? '' : ''
                  }`}>
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      Net Income
                      {mostRecentData.netIncome?.raw >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                    </p>
                    <p className={`text-sm font-semibold ${
                      mostRecentData.netIncome?.raw >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatLargeNumber(mostRecentData.netIncome?.raw)}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Profit Margin</p>
                    <p className="text-sm font-semibold text-foreground">{profitMargin}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Income Statement Table */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Income Statement Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Item</th>
                      {incomeStatementData.slice().reverse().map((item: any, index: number) => (
                        <th key={index} className="text-right py-2 px-3 font-medium text-muted-foreground">
                          {formatDate(item.endDate?.raw)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border hover:bg-muted/30 font-semibold">
                      <td className="py-2 px-3">Total Revenue</td>
                      {incomeStatementData.slice().reverse().map((item: any, index: number) => (
                        <td key={index} className="text-right py-2 px-3">
                          {formatLargeNumber(item.totalRevenue?.raw)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium">Cost of Revenue</td>
                      {incomeStatementData.slice().reverse().map((item: any, index: number) => (
                        <td key={index} className="text-right py-2 px-3">
                          {formatLargeNumber(item.costOfRevenue?.raw)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium">Gross Profit</td>
                      {incomeStatementData.slice().reverse().map((item: any, index: number) => (
                        <td key={index} className="text-right py-2 px-3">
                          {formatLargeNumber(item.grossProfit?.raw)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium">Operating Income</td>
                      {incomeStatementData.slice().reverse().map((item: any, index: number) => (
                        <td key={index} className="text-right py-2 px-3">
                          {formatLargeNumber(item.operatingIncome?.raw)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium">EBIT</td>
                      {incomeStatementData.slice().reverse().map((item: any, index: number) => (
                        <td key={index} className="text-right py-2 px-3">
                          {formatLargeNumber(item.ebit?.raw)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-muted/30 font-semibold">
                      <td className="py-2 px-3">Net Income</td>
                      {incomeStatementData.slice().reverse().map((item: any, index: number) => (
                        <td
                          key={index}
                          className={`text-right py-2 px-3 ${
                            item.netIncome?.raw >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatLargeNumber(item.netIncome?.raw)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trend Chart */}
            {chartData && typeof window !== "undefined" && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Revenue & Net Income Trends</h3>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <Chart
                    options={chartData.options}
                    series={chartData.series}
                    type="bar"
                    height={350}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
