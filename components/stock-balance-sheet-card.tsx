"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Calendar } from "lucide-react"
import dynamic from "next/dynamic"
import { ApiCallDetails } from "@/components/api-call-details"
import { ApiCallMetadata } from "@/types"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface StockBalanceSheetCardProps {
  financialsData: any
  symbol: string
  apiCallDetails?: ApiCallMetadata
}

export default function StockBalanceSheetCard({ financialsData, symbol, apiCallDetails }: StockBalanceSheetCardProps) {
  const [period, setPeriod] = useState<"annual" | "quarterly">("annual")

  if (!financialsData) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No balance sheet data available for {symbol}</p>
        </CardContent>
      </Card>
    )
  }

  // Transform timeseries data into balance sheet statements format
  const transformTimeseriesData = () => {
    if (!financialsData.timeseries) {
      return financialsData.balanceSheetHistory?.balanceSheetStatements || []
    }

    const ts = financialsData.timeseries
    const prefix = period === "annual" ? "annual" : "quarterly"

    // Get all dates from totalAssets (it should have all periods)
    const totalAssetsData = ts[`${prefix}TotalAssets`] || []

    if (totalAssetsData.length === 0) return []

    // Build statements from timeseries data
    return totalAssetsData.map((assetItem: any) => {
      const date = assetItem.asOfDate

      // Helper to find value by date
      const findValue = (timeseriesKey: string) => {
        const data = ts[timeseriesKey] || []
        const item = data.find((d: any) => d.asOfDate === date)
        return item?.reportedValue
      }

      return {
        endDate: {
          raw: new Date(date).getTime() / 1000,
          fmt: date
        },
        totalAssets: findValue(`${prefix}TotalAssets`),
        totalLiab: findValue(`${prefix}TotalLiabilitiesNetMinorityInterest`),
        totalStockholderEquity: findValue(`${prefix}StockholdersEquity`),
        totalCurrentAssets: findValue(`${prefix}CurrentAssets`),
        totalCurrentLiabilities: findValue(`${prefix}CurrentLiabilities`),
        longTermDebt: findValue(`${prefix}LongTermDebt`),
        cash: findValue(`${prefix}CashAndCashEquivalents`),
        inventory: findValue(`${prefix}Inventory`),
        netPPE: findValue(`${prefix}NetPPE`),
      }
    }).reverse() // Most recent first
  }

  const balanceSheetData = transformTimeseriesData()

  // Check if we have actual balance sheet line items (not just dates)
  const hasDetailedData = balanceSheetData.length > 0 &&
    balanceSheetData.some((item: any) =>
      item.totalAssets || item.totalLiab || item.totalStockholderEquity
    )

  // Format date
  const formatDate = (rawDate: number) => {
    const date = new Date(rawDate * 1000)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
  }

  // Format large numbers
  const formatLargeNumber = (num: number | undefined) => {
    if (!num) return "N/A"
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return `$${num.toLocaleString()}`
  }

  // Prepare chart data for assets, liabilities, and equity trends
  const prepareChartData = () => {
    if (!hasDetailedData) return null

    const dates = balanceSheetData.map((item: any) => formatDate(item.endDate?.raw)).reverse()
    const totalAssets = balanceSheetData.map((item: any) => item.totalAssets?.raw || 0).reverse()
    const totalLiabilities = balanceSheetData.map((item: any) => item.totalLiab?.raw || 0).reverse()
    const totalEquity = balanceSheetData.map((item: any) => item.totalStockholderEquity?.raw || 0).reverse()

    return {
      series: [
        { name: "Total Assets", data: totalAssets },
        { name: "Total Liabilities", data: totalLiabilities },
        { name: "Shareholders' Equity", data: totalEquity },
      ],
      options: {
        chart: {
          type: "line" as const,
          height: 350,
          toolbar: { show: true },
          background: "transparent",
        },
        stroke: { curve: "smooth" as const, width: 2 },
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
        colors: ["#10b981", "#f59e0b", "#3b82f6"],
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

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {symbol} - Balance Sheet
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Assets, Liabilities, and Shareholders' Equity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ApiCallDetails apiCallDetails={apiCallDetails} />
            <select
              id="balanceSheetPeriod"
              className="px-3 py-1.5 text-sm rounded-md border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
              value={period}
              onChange={(e) => setPeriod(e.target.value as "annual" | "quarterly")}
            >
              <option value="annual">Annual</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {balanceSheetData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] border border-dashed rounded-lg border-border bg-muted/30">
            <Calendar className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm text-center">
              No {period} balance sheet data available for {symbol}
            </p>
          </div>
        ) : !hasDetailedData ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Available Periods</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {balanceSheetData.map((item: any, index: number) => (
                <div key={index} className="p-3 bg-muted rounded-lg border border-border text-center">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Period {index + 1}</p>
                  <p className="text-sm font-semibold text-foreground">
                    {item.endDate?.fmt || "N/A"}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Detailed balance sheet line items are not available from this data source.
              Try viewing key statistics or other financial metrics.
            </p>
          </div>
        ) : (
          <>
            {/* Balance Sheet Table */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Balance Sheet Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Item</th>
                      {balanceSheetData.slice().reverse().map((item: any, index: number) => (
                        <th key={index} className="text-right py-2 px-3 font-medium text-muted-foreground">
                          {formatDate(item.endDate?.raw)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium">Total Assets</td>
                      {balanceSheetData.slice().reverse().map((item: any, index: number) => (
                        <td key={index} className="text-right py-2 px-3">
                          {formatLargeNumber(item.totalAssets?.raw)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium">Total Liabilities</td>
                      {balanceSheetData.slice().reverse().map((item: any, index: number) => (
                        <td key={index} className="text-right py-2 px-3">
                          {formatLargeNumber(item.totalLiab?.raw)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium">Shareholders' Equity</td>
                      {balanceSheetData.slice().reverse().map((item: any, index: number) => (
                        <td key={index} className="text-right py-2 px-3">
                          {formatLargeNumber(item.totalStockholderEquity?.raw)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium">Current Assets</td>
                      {balanceSheetData.slice().reverse().map((item: any, index: number) => (
                        <td key={index} className="text-right py-2 px-3">
                          {formatLargeNumber(item.totalCurrentAssets?.raw)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium">Current Liabilities</td>
                      {balanceSheetData.slice().reverse().map((item: any, index: number) => (
                        <td key={index} className="text-right py-2 px-3">
                          {formatLargeNumber(item.totalCurrentLiabilities?.raw)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium">Long-Term Debt</td>
                      {balanceSheetData.slice().reverse().map((item: any, index: number) => (
                        <td key={index} className="text-right py-2 px-3">
                          {formatLargeNumber(item.longTermDebt?.raw)}
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
                <h3 className="text-sm font-semibold text-foreground mb-3">Balance Sheet Trends</h3>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <Chart
                    options={chartData.options}
                    series={chartData.series}
                    type="line"
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
