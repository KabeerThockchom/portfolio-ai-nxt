"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

// Define the type for the dynamically imported ApexCharts module
type ApexChartsModule = typeof import("apexcharts");

interface StockChartProps {
  chartData: any
  symbol: string
  viewMode?: "price" | "percent" | "relative"
}

export default function StockChart({ chartData, symbol, viewMode = "price" }: StockChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<any>(null)
  const { theme } = useTheme()
  const [ApexChartsComponent, setApexChartsComponent] = useState<ApexChartsModule | null>(null);
  const [isLoadingChartLib, setIsLoadingChartLib] = useState(true);

  useEffect(() => {
    import("apexcharts")
      .then(module => {
        setApexChartsComponent(() => module.default); // ApexCharts might be a default export
        setIsLoadingChartLib(false);
      })
      .catch(err => {
        console.error("Failed to load ApexCharts:", err);
        setIsLoadingChartLib(false);
        // Optionally, set an error state to display a message to the user
      });
  }, []);

  useEffect(() => {
    if (!chartData || !chartRef.current || !ApexChartsComponent || isLoadingChartLib) {
      // If chart library is still loading, or no data/ref, do nothing or cleanup
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      return;
    }

    const processedData = processChartData(chartData, symbol, viewMode)
    if (!processedData) {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null;
        }
        return;
    }

    const { series, metadata } = processedData

    // Format chart options based on view mode
    let yaxisFormatter
    let tooltipYFormatter
    let chartTitle
    if (viewMode === "price") {
      yaxisFormatter = (val: number) => `$${val.toFixed(2)}`
      tooltipYFormatter = (val: number) => `$${val.toFixed(2)}`

      // Check if there are comparison stocks
      if (processedData.series.length > 1) {
        const comparisonSymbols = processedData.series
          .slice(1)
          .map((s) => s.name)
          .join(", ")
        chartTitle = `${symbol} vs ${comparisonSymbols}`
      } else {
        chartTitle = `${symbol} Stock Price`
      }
    } else if (viewMode === "percent") {
      yaxisFormatter = (val: number) => `${val.toFixed(2)}%`
      tooltipYFormatter = (val: number) => `${val.toFixed(2)}%`

      // Check if there are comparison stocks
      if (processedData.series.length > 1) {
        const comparisonSymbols = processedData.series
          .slice(1)
          .map((s) => s.name)
          .join(", ")
        chartTitle = `${symbol} vs ${comparisonSymbols} - Percent Change`
      } else {
        chartTitle = `${symbol} Percent Change`
      }
    } else if (viewMode === "relative") {
      yaxisFormatter = (val: number) => val.toFixed(2)
      tooltipYFormatter = (val: number) => val.toFixed(2)

      // Check if there are comparison stocks
      if (processedData.series.length > 1) {
        const comparisonSymbols = processedData.series
          .slice(1)
          .map((s) => s.name)
          .join(", ")
        chartTitle = `${symbol} vs ${comparisonSymbols} - Relative Performance`
      } else {
        chartTitle = `${symbol} Relative Performance`
      }
    }

    // Format subtitle with current price and change
    const change = metadata.regularMarketPrice - metadata.chartPreviousClose
    const changePercent = (change / metadata.chartPreviousClose) * 100
    const changeSign = change >= 0 ? "+" : ""
    const subtitleText = `Current: $${metadata.regularMarketPrice?.toFixed(2)} | ${changeSign}$${change.toFixed(2)} (${changeSign}${changePercent.toFixed(2)}%)`

    const isDarkMode = theme === "dark"
    const textColor = isDarkMode ? "#FAFAFA" : "#0A0A0A"
    const gridColor = isDarkMode ? "#262626" : "#E5E5E5"
    const backgroundColor = isDarkMode ? "#0A0A0A" : "#FFFFFF"
    const primaryColor = "#6366F1"
    const successColor = "#10B981"
    const dangerColor = "#EF4444"

    const options = {
      series,
      chart: {
        type: "area",
        height: 350,
        fontFamily: "Inter, sans-serif",
        foreColor: textColor,
        background: backgroundColor,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
        zoom: {
          enabled: true,
        },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 2,
        colors: [primaryColor, "#737373"],
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100],
          colorStops: [
            {
              offset: 0,
              color: primaryColor,
              opacity: 0.4,
            },
            {
              offset: 100,
              color: primaryColor,
              opacity: 0.1,
            },
          ],
        },
      },
      colors: [primaryColor, "#737373"],
      grid: {
        borderColor: gridColor,
        row: {
          colors: ["transparent", "transparent"],
          opacity: 0.2,
        },
        strokeDashArray: 4,
      },
      xaxis: {
        type: "datetime",
        labels: {
          datetimeUTC: false,
          style: {
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
            colors: textColor,
          },
        },
        axisBorder: {
          show: true,
          color: gridColor,
        },
        axisTicks: {
          show: true,
          color: gridColor,
        },
      },
      yaxis: {
        labels: {
          formatter: yaxisFormatter,
          style: {
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
            colors: textColor,
          },
        },
        tickAmount: 5,
      },
      tooltip: {
        x: {
          format: metadata.range === "1d" ? "HH:mm" : "MMM dd, yyyy",
        },
        y: {
          formatter: tooltipYFormatter,
        },
        theme: isDarkMode ? "dark" : "light",
        shared: true,
        intersect: false,
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        offsetY: -15,
        labels: {
          colors: textColor,
        },
        markers: {
          width: 10,
          height: 10,
          radius: 6,
        },
      },
      title: {
        text: chartTitle,
        align: "center",
        style: {
          fontSize: "18px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          color: textColor,
        },
      },
      subtitle: {
        text: subtitleText,
        align: "center",
        style: {
          fontSize: "14px",
          fontFamily: "Inter, sans-serif",
          color: change >= 0 ? successColor : dangerColor,
        },
      },
      markers: {
        size: 0,
        hover: {
          size: 5,
        },
      },
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.updateOptions(options)
    } else {
      // Use the dynamically imported ApexChartsComponent here
      chartInstanceRef.current = new ApexChartsComponent(chartRef.current, options)
      chartInstanceRef.current.render()
    }

    if (viewMode === "price") {
      addEventAnnotations(chartInstanceRef.current, chartData)
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
        chartInstanceRef.current = null
      }
    }
    // Ensure all dependencies are correct, especially ApexChartsComponent and isLoadingChartLib
  }, [chartData, symbol, viewMode, theme, ApexChartsComponent, isLoadingChartLib]) 

  const processChartData = (chartData: any, symbol: string, viewMode: string) => {
    if (!chartData || !chartData.chart || !chartData.chart.result || chartData.chart.result.length === 0) {
      return null
    }

    const result = chartData.chart.result[0]
    const timestamps = result.timestamp || []
    const quotes = result.indicators.quote[0] || {}
    const closes = quotes.close || []
    const metadata = result.meta || {}

    const mainSymbol = result.meta.symbol
    let mainSeriesData

    if (viewMode === "price") {
      mainSeriesData = timestamps
        .map((timestamp: number, index: number) => {
          if (closes[index] === null || closes[index] === undefined) return null
          return [timestamp * 1000, closes[index]]
        })
        .filter((point: any) => point !== null)
    } else if (viewMode === "percent") {
      const firstClose = closes.find((val: any) => val !== null && val !== undefined)
      if (firstClose) {
        mainSeriesData = timestamps
          .map((timestamp: number, index: number) => {
            if (closes[index] === null || closes[index] === undefined) return null
            const percentChange = ((closes[index] - firstClose) / firstClose) * 100
            return [timestamp * 1000, percentChange]
          })
          .filter((point: any) => point !== null)
      }
    } else if (viewMode === "relative") {
      const firstClose = closes.find((val: any) => val !== null && val !== undefined)
      if (firstClose) {
        mainSeriesData = timestamps
          .map((timestamp: number, index: number) => {
            if (closes[index] === null || closes[index] === undefined) return null
            const relativeValue = (closes[index] / firstClose) * 100
            return [timestamp * 1000, relativeValue]
          })
          .filter((point: any) => point !== null)
      }
    }

    const series = [
      {
        name: mainSymbol,
        data: mainSeriesData || [],
      },
    ]

    if (result.comparisons && result.comparisons.length > 0) {
      const comparisonSeries = result.comparisons.map((comparison: any) => {
        const compSymbol = comparison.symbol
        const compClose = comparison.close || []
        let compData
        if (viewMode === "price") {
          compData = timestamps
            .map((timestamp: number, index: number) => {
              if (compClose[index] === null || compClose[index] === undefined) return null
              return [timestamp * 1000, compClose[index]]
            })
            .filter((point: any) => point !== null)
        } else if (viewMode === "percent") {
          const firstCompClose = compClose.find((val: any) => val !== null && val !== undefined)
          if (firstCompClose) {
            compData = timestamps
              .map((timestamp: number, index: number) => {
                if (compClose[index] === null || compClose[index] === undefined) return null
                const percentChange = ((compClose[index] - firstCompClose) / firstCompClose) * 100
                return [timestamp * 1000, percentChange]
              })
              .filter((point: any) => point !== null)
          }
        } else if (viewMode === "relative") {
          const firstCompClose = compClose.find((val: any) => val !== null && val !== undefined)
          if (firstCompClose) {
            compData = timestamps
              .map((timestamp: number, index: number) => {
                if (compClose[index] === null || compClose[index] === undefined) return null
                const relativeValue = (compClose[index] / firstCompClose) * 100
                return [timestamp * 1000, relativeValue]
              })
              .filter((point: any) => point !== null)
          }
        }
        return {
          name: compSymbol,
          data: compData || [],
        }
      })
      series.push(...comparisonSeries)
    }
    return {
      series,
      metadata,
    }
  }

  const addEventAnnotations = (chart: any, chartData: any) => {
    if (!chartData || !chartData.chart || !chartData.chart.result || chartData.chart.result.length === 0) return;
    const chartToAnnotate = chart;
    const result = chartData.chart.result[0];

    if (!result.events) return;

    const annotations = {
      xaxis: [] as any[],
    };

    if (result.events.dividends) {
      Object.values(result.events.dividends).forEach((dividend: any) => {
        annotations.xaxis.push({
          x: new Date(dividend.date * 1000).getTime(),
          borderColor: "#6366F1",
          label: {
            borderColor: "#6366F1",
            style: { color: "#FFFFFF", background: "#6366F1" },
            text: `Dividend: $${dividend.amount}`,
          },
        });
      });
    }

    if (result.events.splits) {
      Object.values(result.events.splits).forEach((split: any) => {
        annotations.xaxis.push({
          x: new Date(split.date * 1000).getTime(),
          borderColor: "#6366F1",
          label: {
            borderColor: "#6366F1",
            style: { color: "#FFFFFF", background: "#6366F1" },
            text: `Split: ${split.numerator}:${split.denominator}`,
          },
        });
      });
    }

    if (result.events.earnings) {
      Object.values(result.events.earnings).forEach((earning: any) => {
        annotations.xaxis.push({
          x: new Date(earning.date * 1000).getTime(),
          borderColor: "#6366F1",
          label: {
            borderColor: "#6366F1",
            style: { color: "#FFFFFF", background: "#6366F1" },
            text: "Earnings",
          },
        });
      });
    }

    if (annotations.xaxis.length > 0) {
      chartToAnnotate.updateOptions({ annotations });
    }
  }

  if (isLoadingChartLib) {
    return <div className="w-full h-[350px] flex items-center justify-center text-muted-foreground">Loading Chart Library...</div>;
  }

  // When chartData is not available yet, but library is loaded, show a placeholder or different loading state
  if (!chartData) {
    return <div className="w-full h-[350px] flex items-center justify-center text-muted-foreground">Loading Chart Data...</div>;
  }

  return <div ref={chartRef} className="w-full h-full min-h-[350px]"></div>
}

