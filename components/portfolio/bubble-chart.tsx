"use client"

import React from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BubbleChartData } from "@/types/portfolio"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface BubbleChartProps {
  data: BubbleChartData[]
  title: string
  subtitle?: string
}

export function BubbleChart({ data, title, subtitle }: BubbleChartProps) {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const textColor = isDarkMode ? "#FFFFFF" : "#333333"
  const gridColor = isDarkMode ? "#999999" : "#CCCCCC"
  const backgroundColor = isDarkMode ? "#333333" : "#FFFFFF"

  const options = {
    chart: {
      type: "bubble" as const,
      background: "transparent",
      toolbar: {
        show: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 0.8,
    },
    xaxis: {
      type: "category" as const,
      title: {
        text: "Asset / Sector",
        style: {
          color: textColor,
        },
      },
      labels: {
        style: {
          colors: textColor,
        },
      },
    },
    yaxis: {
      title: {
        text: "Investment Amount ($)",
        style: {
          color: textColor,
        },
      },
      labels: {
        formatter: function (val: number) {
          return "$" + val.toLocaleString()
        },
        style: {
          colors: textColor,
        },
      },
    },
    tooltip: {
      theme: isDarkMode ? "dark" : "light",
      custom: function ({ seriesIndex, dataPointIndex, w }: any) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex]
        return `
          <div style="padding: 10px; background: ${backgroundColor}; border: 1px solid ${gridColor}; border-radius: 4px; color: ${textColor};">
            <div><strong>${data.x}</strong></div>
            <div>Amount: $${data.y.toLocaleString()}</div>
            <div>Risk Score: ${data.z.toFixed(1)} / 10</div>
          </div>
        `
      },
    },
    colors: ["#FFE600", "#FFFFFF", "#999999", "#666666", "#CCCCCC"],
    legend: {
      show: true,
      position: "bottom" as const,
      labels: {
        colors: textColor,
      },
    },
    grid: {
      borderColor: gridColor,
    },
    theme: {
      mode: (isDarkMode ? "dark" : "light") as const,
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <Chart options={options} series={data} type="bubble" height={400} />
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            <strong>Bubble Size</strong> represents risk score (larger = higher risk)
          </p>
          <p>
            <strong>Y-Axis</strong> represents investment amount
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
