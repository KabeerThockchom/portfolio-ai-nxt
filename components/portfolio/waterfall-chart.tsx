"use client"

import React from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WaterfallChartData } from "@/types/portfolio"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface WaterfallChartProps {
  data: WaterfallChartData
  title: string
  subtitle?: string
}

export function WaterfallChart({ data, title, subtitle }: WaterfallChartProps) {
  // Transform data for waterfall chart
  const transformedData = data.data.map((value, index) => {
    if (index === data.data.length - 1) {
      // Last item is total
      return {
        x: data.categories[index],
        y: value,
        fillColor: value >= 0 ? "#FFE600" : "#999999",
      }
    }
    return {
      x: data.categories[index],
      y: value,
      fillColor: value >= 0 ? "#CCCCCC" : "#999999",
    }
  })

  const options = {
    chart: {
      type: "bar" as const,
      background: "transparent",
      toolbar: {
        show: true,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "60%",
        dataLabels: {
          position: "top" as const,
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val >= 0 ? `+$${val.toFixed(0)}` : `-$${Math.abs(val).toFixed(0)}`
      },
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#999999"],
      },
    },
    xaxis: {
      type: "category" as const,
      labels: {
        style: {
          colors: "#999999",
        },
      },
    },
    yaxis: {
      title: {
        text: "Contribution ($)",
      },
      labels: {
        formatter: function (val: number) {
          return "$" + val.toLocaleString()
        },
        style: {
          colors: "#999999",
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val >= 0 ? `+$${val.toLocaleString()}` : `-$${Math.abs(val).toLocaleString()}`
        },
      },
    },
    legend: {
      show: false,
    },
    grid: {
      borderColor: "#CCCCCC",
    },
  }

  const series = [
    {
      name: "Contribution",
      data: transformedData,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <Chart options={options} series={series} type="bar" height={350} />
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#CCCCCC" }}></div>
            <span>Positive Contribution</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#999999" }}></div>
            <span>Negative Contribution</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span>Total Return</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
