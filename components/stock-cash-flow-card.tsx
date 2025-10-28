"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Calendar, ArrowDownCircle, ArrowUpCircle } from "lucide-react"
import dynamic from "next/dynamic"
import { ApiCallDetails } from "@/components/api-call-details"
import { ApiCallMetadata } from "@/types"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface StockCashFlowCardProps {
  financialsData: any
  symbol: string
  apiCallDetails?: ApiCallMetadata
}

export default function StockCashFlowCard({ financialsData, symbol, apiCallDetails }: StockCashFlowCardProps) {
  const [period, setPeriod] = useState<"annual" | "quarterly">("annual")

  if (!financialsData) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No cash flow data available for {symbol}</p>
        </CardContent>
      </Card>
    )
  }

  const cashFlowData = period === "annual"
    ? financialsData.cashflowStatementHistory?.cashflowStatements || []
    : financialsData.cashflowStatementHistoryQuarterly?.cashflowStatements || []

  // Check if we have cash flow data (even if limited)
  const hasData = cashFlowData.length > 0

  // Check if we have detailed cash flow data beyond just net income
  const hasDetailedData = cashFlowData.length > 0 &&
    cashFlowData.some((item: any) =>
      item.totalCashFromOperatingActivities ||
      item.totalCashflowsFromInvestingActivities ||
      item.totalCashFromFinancingActivities
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

  // Prepare chart data for cash flow trends
  const prepareChartData = () => {
    if (!hasDetailedData) {
      // If we only have net income, show that
      if (hasData) {
        const dates = cashFlowData.map((item: any) => formatDate(item.endDate?.raw)).reverse()
        const netIncome = cashFlowData.map((item: any) => item.netIncome?.raw || 0).reverse()

        return {
          series: [{ name: "Net Income", data: netIncome }],
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
            colors: ["#10b981"],
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
      return null
    }

    const dates = cashFlowData.map((item: any) => formatDate(item.endDate?.raw)).reverse()
    const operatingCF = cashFlowData.map((item: any) => item.totalCashFromOperatingActivities?.raw || 0).reverse()
    const investingCF = cashFlowData.map((item: any) => item.totalCashflowsFromInvestingActivities?.raw || 0).reverse()
    const financingCF = cashFlowData.map((item: any) => item.totalCashFromFinancingActivities?.raw || 0).reverse()

    return {
      series: [
        { name: "Operating Activities", data: operatingCF },
        { name: "Investing Activities", data: investingCF },
        { name: "Financing Activities", data: financingCF },
      ],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: true },
          background: "transparent",
          stacked: false,
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
              <Activity className="h-5 w-5 text-primary" />
              {symbol} - Cash Flow Statement
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Operating, Investing, and Financing Activities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ApiCallDetails apiCallDetails={apiCallDetails} />
            <select
              id="cashFlowPeriod"
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
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-[200px] border border-dashed rounded-lg border-border bg-muted/30">
            <Calendar className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm text-center">
              No {period} cash flow data available for {symbol}
            </p>
          </div>
        ) : (
          <>
            {/* Cash Flow Table */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Cash Flow Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Item</th>
                      {cashFlowData.slice().reverse().map((item: any, index: number) => (
                        <th key={index} className="text-right py-2 px-3 font-medium text-muted-foreground">
                          {formatDate(item.endDate?.raw)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border hover:bg-muted/30 font-semibold">
                      <td className="py-2 px-3">Net Income</td>
                      {cashFlowData.slice().reverse().map((item: any, index: number) => (
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
                    {hasDetailedData && (
                      <>
                        <tr className="border-b border-border hover:bg-muted/30">
                          <td className="py-2 px-3 font-medium flex items-center gap-1">
                            <ArrowDownCircle className="h-4 w-4 text-green-500" />
                            Operating Activities
                          </td>
                          {cashFlowData.slice().reverse().map((item: any, index: number) => (
                            <td
                              key={index}
                              className={`text-right py-2 px-3 ${
                                item.totalCashFromOperatingActivities?.raw >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {formatLargeNumber(item.totalCashFromOperatingActivities?.raw)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-border hover:bg-muted/30">
                          <td className="py-2 px-3 font-medium flex items-center gap-1">
                            <ArrowUpCircle className="h-4 w-4 text-orange-500" />
                            Investing Activities
                          </td>
                          {cashFlowData.slice().reverse().map((item: any, index: number) => (
                            <td
                              key={index}
                              className={`text-right py-2 px-3 ${
                                item.totalCashflowsFromInvestingActivities?.raw >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {formatLargeNumber(item.totalCashflowsFromInvestingActivities?.raw)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-border hover:bg-muted/30">
                          <td className="py-2 px-3 font-medium flex items-center gap-1">
                            <ArrowUpCircle className="h-4 w-4 text-blue-500" />
                            Financing Activities
                          </td>
                          {cashFlowData.slice().reverse().map((item: any, index: number) => (
                            <td
                              key={index}
                              className={`text-right py-2 px-3 ${
                                item.totalCashFromFinancingActivities?.raw >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {formatLargeNumber(item.totalCashFromFinancingActivities?.raw)}
                            </td>
                          ))}
                        </tr>
                        <tr className="hover:bg-muted/30">
                          <td className="py-2 px-3 font-semibold">Free Cash Flow</td>
                          {cashFlowData.slice().reverse().map((item: any, index: number) => (
                            <td
                              key={index}
                              className={`text-right py-2 px-3 font-semibold ${
                                item.freeCashflow?.raw >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {formatLargeNumber(item.freeCashflow?.raw)}
                            </td>
                          ))}
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              {!hasDetailedData && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Detailed cash flow breakdown by activity is limited. Only net income data is available.
                </p>
              )}
            </div>

            {/* Trend Chart */}
            {chartData && typeof window !== "undefined" && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {hasDetailedData ? "Cash Flow Trends by Activity" : "Net Income Trend"}
                </h3>
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
