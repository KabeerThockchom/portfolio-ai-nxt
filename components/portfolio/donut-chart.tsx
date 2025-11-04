"use client"

import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import type { DonutChartData, PortfolioAggregation } from "@/types/portfolio"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface DonutChartProps {
  data: DonutChartData
  aggregationData?: PortfolioAggregation[]  // For multi-level support
  title: string
  subtitle?: string
}

export function DonutChart({ data, aggregationData, title, subtitle }: DonutChartProps) {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const textColor = isDarkMode ? "#FFFFFF" : "#333333"

  // State for multi-level navigation
  const [currentLevel, setCurrentLevel] = useState<"top" | "drill">("top")
  const [selectedParent, setSelectedParent] = useState<PortfolioAggregation | null>(null)
  const [chartData, setChartData] = useState<DonutChartData>(data)

  // Reset to top level when data changes
  useEffect(() => {
    setChartData(data)
    setCurrentLevel("top")
    setSelectedParent(null)
  }, [data])

  // Handle drill-down to sectors
  const handleSliceClick = (event: any, chartContext: any, config: any) => {
    if (!aggregationData) return  // No multi-level data available

    const clickedIndex = config.dataPointIndex
    if (clickedIndex === -1 || currentLevel === "drill") return  // Already at drill level

    const parent = aggregationData[clickedIndex]
    if (!parent || !parent.children || parent.children.length === 0) return  // No children to drill into

    // Create chart data for children (sectors)
    const sectorColors: Record<string, string> = {
      "Technology": "#00D9FF",
      "Healthcare": "#00FF88",
      "Financial Services": "#FFD700",
      "Consumer Cyclical": "#FF6B9D",
      "Energy": "#FF4500",
      "Industrials": "#9370DB",
      "Consumer Defensive": "#32CD32",
      "Real Estate": "#FF8C00",
      "Utilities": "#4169E1",
      "Communication Services": "#FF1493",
      "Basic Materials": "#8B4513",
    }

    const drillData: DonutChartData = {
      labels: parent.children.map(c => c.label),
      series: parent.children.map(c => c.totalValue),
      colors: parent.children.map(c => sectorColors[c.label] || "#999999"),
    }

    setSelectedParent(parent)
    setChartData(drillData)
    setCurrentLevel("drill")
  }

  // Handle back to top level
  const handleBackToTop = () => {
    setChartData(data)
    setCurrentLevel("top")
    setSelectedParent(null)
  }

  const options = {
    chart: {
      type: "donut" as const,
      background: "transparent",
      events: {
        dataPointSelection: aggregationData ? handleSliceClick : undefined,
      },
    },
    labels: chartData.labels,
    colors: chartData.colors || [
      "#FFE600", // EY Yellow
      "#FFFFFF", // White
      "#CCCCCC", // EY Light gray
      "#999999", // EY Medium gray
      "#666666", // Darker medium gray
      "#333333", // EY Dark gray
      "#E6E6E6", // Very light gray
      "#B3B3B3", // Light-medium gray
    ],
    legend: {
      position: "bottom" as const,
      labels: {
        colors: textColor,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toFixed(1) + "%"
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "16px",
              fontWeight: 600,
              color: textColor,
              formatter: function (w: any) {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
                return `$${total.toLocaleString()}`
              },
            },
            value: {
              color: textColor,
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom" as const,
          },
        },
      },
    ],
    theme: {
      mode: (isDarkMode ? "dark" : "light") as const,
    },
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle>
              {currentLevel === "drill" && selectedParent
                ? `${selectedParent.label} - Sector Breakdown`
                : title}
            </CardTitle>
            {subtitle && currentLevel === "top" && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {currentLevel === "drill" && selectedParent && (
              <p className="text-sm text-muted-foreground">
                Total: ${selectedParent.totalValue.toLocaleString()}
              </p>
            )}
          </div>
          {currentLevel === "drill" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToTop}
              className="ml-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Chart options={options} series={chartData.series} type="donut" height={350} />
      </CardContent>
    </Card>
  )
}
