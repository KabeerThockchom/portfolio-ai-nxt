"use client"

import React from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

export interface PriceTrendChartData {
  categories: string[] // Dates
  series: Array<{
    name: string // Asset name
    data: number[] // Percent change from start
  }>
}

interface PriceTrendChartProps {
  data: PriceTrendChartData
  title: string
  subtitle?: string
  timeHistory: number // Years
}

export function PriceTrendChart({
  data,
  title,
  subtitle,
  timeHistory,
}: PriceTrendChartProps) {
  const options = {
    chart: {
      type: "line" as const,
      background: "transparent",
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true,
      },
    },
    stroke: {
      width: 3,
      curve: "smooth" as const,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: data.categories,
      type: "datetime" as const,
      title: {
        text: "Date",
      },
      labels: {
        style: {
          colors: "#999999",
        },
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM 'yy",
          day: "dd MMM",
          hour: "HH:mm",
        },
      },
    },
    yaxis: {
      title: {
        text: "% Change from Start",
      },
      labels: {
        formatter: function (val: number) {
          return val.toFixed(1) + "%"
        },
        style: {
          colors: "#999999",
        },
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: "light",
      style: {
        fontSize: "12px",
      },
      y: {
        formatter: function (val: number) {
          return val >= 0 ? `+${val.toFixed(2)}%` : `${val.toFixed(2)}%`
        },
      },
      x: {
        format: "dd MMM yyyy",
      },
    },
    legend: {
      position: "top" as const,
      horizontalAlign: "left" as const,
      labels: {
        colors: "#999999",
      },
    },
    colors: ["#FFE600", "#CCCCCC", "#999999", "#666666", "#B3B3B3"],
    grid: {
      borderColor: "#CCCCCC",
    },
    markers: {
      size: 0,
      hover: {
        size: 6,
      },
    },
  }

  // Calculate statistics for each holding
  const stats = data.series.map((series) => {
    const latestReturn = series.data[series.data.length - 1]
    const minReturn = Math.min(...series.data)
    const maxReturn = Math.max(...series.data)

    return {
      name: series.name,
      latestReturn,
      minReturn,
      maxReturn,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        <p className="text-xs text-muted-foreground">
          {timeHistory} year{timeHistory > 1 ? "s" : ""} performance
        </p>
      </CardHeader>
      <CardContent>
        <Chart options={options} series={data.series} type="line" height={400} />

        {/* Statistics Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2">Asset</th>
                <th className="text-right py-2 px-2">Current Return</th>
                <th className="text-right py-2 px-2">Min Return</th>
                <th className="text-right py-2 px-2">Max Return</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat, index) => (
                <tr key={index} className="border-b border-border/50">
                  <td className="py-2 px-2 font-medium">{stat.name}</td>
                  <td
                    className={`text-right py-2 px-2 font-semibold ${
                      stat.latestReturn >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.latestReturn >= 0 ? "+" : ""}
                    {stat.latestReturn.toFixed(2)}%
                  </td>
                  <td
                    className={`text-right py-2 px-2 ${
                      stat.minReturn >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.minReturn >= 0 ? "+" : ""}
                    {stat.minReturn.toFixed(2)}%
                  </td>
                  <td
                    className={`text-right py-2 px-2 ${
                      stat.maxReturn >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.maxReturn >= 0 ? "+" : ""}
                    {stat.maxReturn.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
