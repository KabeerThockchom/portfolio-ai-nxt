interface StockInfoPanelProps {
  stock: string
  chartData: any
}

export default function StockInfoPanel({ stock, chartData }: StockInfoPanelProps) {
  if (!chartData || !chartData.chart || !chartData.chart.result || chartData.chart.result.length === 0) {
    return <div className="col-span-3 text-center">No data available</div>
  }

  const result = chartData.chart.result[0]
  const meta = result.meta || {}
  const isMainStock = stock === result.meta.symbol

  // For main stock
  if (isMainStock) {
    // Calculate change
    const change = meta.regularMarketPrice - meta.chartPreviousClose
    const changePercent = (change / meta.chartPreviousClose) * 100
    const changeSign = change >= 0 ? "+" : ""
    const cssClass = change >= 0 ? "text-green-600" : "text-red-600"

    return (
      <>
        <InfoCard title="Current Price" value={`$${meta.regularMarketPrice?.toFixed(2) || "N/A"}`} />
        <InfoCard
          title="Change"
          value={`${changeSign}$${change.toFixed(2)} (${changeSign}${changePercent.toFixed(2)}%)`}
          cssClass={cssClass}
        />
        <InfoCard
          title="Day Range"
          value={`$${meta.regularMarketDayLow?.toFixed(2) || "N/A"} - $${meta.regularMarketDayHigh?.toFixed(2) || "N/A"}`}
        />
        <InfoCard
          title="52 Week Range"
          value={`$${meta.fiftyTwoWeekLow?.toFixed(2) || "N/A"} - $${meta.fiftyTwoWeekHigh?.toFixed(2) || "N/A"}`}
        />
        <InfoCard title="Volume" value={`${meta.regularMarketVolume?.toLocaleString() || "N/A"}`} />
        <InfoCard title="Previous Close" value={`$${meta.chartPreviousClose?.toFixed(2) || "N/A"}`} />
        <InfoCard title="Exchange" value={meta.exchangeName || "N/A"} />
      </>
    )
  }
  // For comparison stocks
  else {
    // Find the comparison stock data
    const comparisonData = result.comparisons.find((comp: any) => comp.symbol === stock)

    if (!comparisonData) {
      return <div className="col-span-3 text-center">No data available for {stock}</div>
    }

    // Current Price
    const currentPrice = comparisonData.close[comparisonData.close.length - 1]

    // Change calculation
    const prevClose = comparisonData.previousClose || comparisonData.chartPreviousClose
    let changeText = "N/A"
    let cssClass = ""

    if (
      currentPrice !== undefined &&
      prevClose !== undefined &&
      !isNaN(currentPrice) &&
      !isNaN(prevClose) &&
      prevClose !== 0
    ) {
      const change = currentPrice - prevClose
      const changePercent = (change / prevClose) * 100
      cssClass = change >= 0 ? "text-green-600" : "text-red-600"
      const changeSign = change >= 0 ? "+" : ""
      changeText = `${changeSign}$${change.toFixed(2)} (${changeSign}${changePercent.toFixed(2)}%)`
    }

    // Min/Max calculation
    let periodHigh = "N/A"
    let periodLow = "N/A"

    if (comparisonData.high && comparisonData.high.length && comparisonData.low && comparisonData.low.length) {
      // Filter out null/undefined values
      const highValues = comparisonData.high.filter((val: any) => val !== null && val !== undefined && !isNaN(val))
      const lowValues = comparisonData.low.filter((val: any) => val !== null && val !== undefined && !isNaN(val))

      if (highValues.length && lowValues.length) {
        const maxPrice = Math.max(...highValues)
        const minPrice = Math.min(...lowValues)
        periodHigh = `$${maxPrice.toFixed(2)}`
        periodLow = `$${minPrice.toFixed(2)}`
      }
    }

    return (
      <>
        <InfoCard title="Current Price" value={`$${currentPrice?.toFixed(2) || "N/A"}`} />
        <InfoCard title="Change" value={changeText} cssClass={cssClass} />
        <InfoCard title="Previous Close" value={`$${prevClose?.toFixed(2) || "N/A"}`} />
        <InfoCard title="Period High" value={periodHigh} />
        <InfoCard title="Period Low" value={periodLow} />
        <InfoCard title="Symbol" value={stock} />
        <InfoCard title="Chart Period" value={result.meta.range || "N/A"} />
      </>
    )
  }
}

interface InfoCardProps {
  title: string
  value: string
  cssClass?: string
}

function InfoCard({ title, value, cssClass = "" }: InfoCardProps) {
  return (
    <div className="info-card p-4 bg-muted rounded-lg">
      <h3 className="text-sm font-medium mb-1">{title}</h3>
      <p className={`text-lg font-semibold ${cssClass}`}>{value}</p>
    </div>
  )
}
