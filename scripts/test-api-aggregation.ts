import * as dotenv from "dotenv"

dotenv.config()

async function testAggregationAPI() {
  const baseUrl = "http://localhost:3000"

  console.log("=== TESTING ASSET CLASS AGGREGATION API ===\n")

  try {
    const assetClassResponse = await fetch(`${baseUrl}/api/portfolio/aggregation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: 1,
        dimension: "asset_class",
        metric: "total_value",
      }),
    })

    const assetClassData = await assetClassResponse.json()

    if (assetClassData.success) {
      console.log("Asset Class Aggregation:")
      console.log("Status: SUCCESS")
      console.log("\nBreakdown:")

      let total = 0
      assetClassData.data.aggregation.forEach((item: any) => {
        console.log(`  ${item.label}: $${item.totalValue.toFixed(2)}`)
        total += item.totalValue
      })
      console.log(`\nTotal: $${total.toFixed(2)}`)

      console.log("\nChart Data Labels:", assetClassData.data.chartData.labels)
      console.log("Chart Data Series:", assetClassData.data.chartData.series.map((v: number) => `$${v.toFixed(2)}`))
      console.log("Chart Data Colors:", assetClassData.data.chartData.colors)
    } else {
      console.error("Asset Class Aggregation FAILED:", assetClassData.error)
    }
  } catch (error) {
    console.error("Error testing asset class aggregation:", error)
  }

  console.log("\n\n=== TESTING SECTOR AGGREGATION API ===\n")

  try {
    const sectorResponse = await fetch(`${baseUrl}/api/portfolio/aggregation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: 1,
        dimension: "sector",
        metric: "total_value",
      }),
    })

    const sectorData = await sectorResponse.json()

    if (sectorData.success) {
      console.log("Sector Aggregation:")
      console.log("Status: SUCCESS")
      console.log("\nBreakdown:")

      let total = 0
      const sortedSectors = sectorData.data.aggregation.sort((a: any, b: any) => b.totalValue - a.totalValue)

      sortedSectors.forEach((item: any) => {
        console.log(`  ${item.label}: $${item.totalValue.toFixed(2)}`)
        total += item.totalValue
      })
      console.log(`\nTotal: $${total.toFixed(2)}`)

      console.log("\nChart Data Labels:", sectorData.data.chartData.labels)
      console.log("Chart Data Series:", sectorData.data.chartData.series.map((v: number) => `$${v.toFixed(2)}`))
      console.log("\nFirst 5 Colors:", sectorData.data.chartData.colors.slice(0, 5))
    } else {
      console.error("Sector Aggregation FAILED:", sectorData.error)
    }
  } catch (error) {
    console.error("Error testing sector aggregation:", error)
  }

  console.log("\n\n=== COMPARISON WITH EXPECTED VALUES ===\n")
  console.log("Expected Asset Class Total: $28,281.32")
  console.log("Expected Sector Total: $16,558.11 (only from ETFs/Mutual Funds with sector data)")
  console.log("\nNote: Sector total should be less than asset class total because")
  console.log("individual stocks (AAPL, JNJ, NSRGY, TM) and IEF have no sector data.")
}

testAggregationAPI()
