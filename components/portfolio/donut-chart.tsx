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
  initialDrillPath?: string[]  // For restoring from history
}

export function DonutChart({ data, aggregationData, title, subtitle, initialDrillPath }: DonutChartProps) {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const textColor = isDarkMode ? "#FFFFFF" : "#333333"

  // State for multi-level navigation using drill path
  const [drillPath, setDrillPath] = useState<string[]>(initialDrillPath || [])
  const [chartData, setChartData] = useState<DonutChartData>(data)
  const [currentData, setCurrentData] = useState<PortfolioAggregation[]>(aggregationData || [])

  // Reset to top level when data changes
  useEffect(() => {
    // If initialDrillPath is provided, restore the drill-down state
    if (initialDrillPath && initialDrillPath.length > 0 && aggregationData) {
      // Traverse down to the drill path level
      let targetData: PortfolioAggregation[] = aggregationData
      for (const pathLabel of initialDrillPath) {
        const parent = targetData.find(item => item.label === pathLabel)
        if (parent && parent.children) {
          targetData = parent.children
        }
      }

      // Sector color mapping
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

      const defaultColorPalette = [
        "#00D9FF", "#00FF88", "#FFD700", "#FF6B9D", "#FF4500",
        "#9370DB", "#32CD32", "#FF8C00", "#4169E1", "#FF1493",
        "#8B4513", "#BA55D3", "#DC143C", "#FF69B4", "#1E90FF",
        "#FFA500", "#DAA520", "#20B2AA", "#FF6347", "#7B68EE"
      ]

      const restoredChartData: DonutChartData = {
        labels: targetData.map(c => c.label),
        series: targetData.map(c => c.totalValue),
        colors: targetData.map((c, index) =>
          sectorColors[c.label] || defaultColorPalette[index % defaultColorPalette.length]
        ),
      }

      setDrillPath(initialDrillPath)
      setCurrentData(targetData)
      setChartData(restoredChartData)
    } else {
      // No drill path, reset to top level
      setChartData(data)
      setDrillPath([])
      setCurrentData(aggregationData || [])
    }
  }, [data, aggregationData, initialDrillPath])

  // Handle drill-down through arbitrary levels
  const handleSliceClick = (event: any, chartContext: any, config: any) => {
    if (!aggregationData) return  // No multi-level data available

    const clickedIndex = config.dataPointIndex
    if (clickedIndex === -1) return

    // Get the current level's data to find the clicked item
    const parent = currentData[clickedIndex]
    if (!parent || !parent.children || parent.children.length === 0) return  // No children to drill into

    // Sector color mapping
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

    // Default color palette for deeper levels (tickers, etc.)
    const defaultColorPalette = [
      "#00D9FF", "#00FF88", "#FFD700", "#FF6B9D", "#FF4500",
      "#9370DB", "#32CD32", "#FF8C00", "#4169E1", "#FF1493",
      "#8B4513", "#BA55D3", "#DC143C", "#FF69B4", "#1E90FF",
      "#FFA500", "#DAA520", "#20B2AA", "#FF6347", "#7B68EE"
    ]

    // Create chart data for children
    const drillData: DonutChartData = {
      labels: parent.children.map(c => c.label),
      series: parent.children.map(c => c.totalValue),
      colors: parent.children.map((c, index) =>
        sectorColors[c.label] || defaultColorPalette[index % defaultColorPalette.length]
      ),
    }

    // Update drill path and current data
    setDrillPath([...drillPath, parent.label])
    setCurrentData(parent.children)
    setChartData(drillData)
  }

  // Handle navigation to specific level in drill path
  const navigateToLevel = (levelIndex: number) => {
    if (levelIndex === -1) {
      // Back to top level
      setChartData(data)
      setDrillPath([])
      setCurrentData(aggregationData || [])
      return
    }

    // Navigate to a specific level in the path
    const targetPath = drillPath.slice(0, levelIndex + 1)
    let targetData: PortfolioAggregation[] = aggregationData || []

    // Traverse down to the target level
    for (const pathLabel of targetPath) {
      const parent = targetData.find(item => item.label === pathLabel)
      if (parent && parent.children) {
        targetData = parent.children
      }
    }

    // Sector color mapping
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

    const defaultColorPalette = [
      "#00D9FF", "#00FF88", "#FFD700", "#FF6B9D", "#FF4500",
      "#9370DB", "#32CD32", "#FF8C00", "#4169E1", "#FF1493",
      "#8B4513", "#BA55D3", "#DC143C", "#FF69B4", "#1E90FF",
      "#FFA500", "#DAA520", "#20B2AA", "#FF6347", "#7B68EE"
    ]

    const newChartData: DonutChartData = {
      labels: targetData.map(c => c.label),
      series: targetData.map(c => c.totalValue),
      colors: targetData.map((c, index) =>
        sectorColors[c.label] || defaultColorPalette[index % defaultColorPalette.length]
      ),
    }

    setDrillPath(targetPath)
    setCurrentData(targetData)
    setChartData(newChartData)
  }

  // Handle back to top level
  const handleBackToTop = () => {
    navigateToLevel(-1)
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
      "#FFE600", //   Yellow
      "#FFFFFF", // White
      "#CCCCCC", //   Light gray
      "#999999", //   Medium gray
      "#666666", // Darker medium gray
      "#333333", //   Dark gray
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
              {drillPath.length > 0
                ? `${drillPath[drillPath.length - 1]} - Breakdown`
                : title}
            </CardTitle>
            {subtitle && drillPath.length === 0 && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {/* Breadcrumb Navigation */}
            {drillPath.length > 0 && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                <button
                  onClick={handleBackToTop}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Portfolio
                </button>
                {drillPath.map((pathItem, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">/</span>
                    <button
                      onClick={() => navigateToLevel(index)}
                      className={`text-xs transition-colors ${
                        index === drillPath.length - 1
                          ? "text-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {pathItem}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {drillPath.length > 0 && (
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
