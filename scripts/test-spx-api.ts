import dotenv from "dotenv"
import { resolve } from "path"

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env") })

async function testSPX() {
  console.log("Testing SPX API call...")
  console.log("API Key:", process.env.RAPID_API_KEY ? "✅ Loaded" : "❌ Missing")

  const symbol = "SPX"
  const period1 = "2024-11-04"
  const period2 = "2025-11-04"
  const region = "US"
  const interval = "1d"

  const params = new URLSearchParams()
  params.append("symbol", symbol)
  params.append("region", region)
  params.append("period1", period1)
  params.append("period2", period2)
  params.append("interval", interval)
  params.append("events", "div,split,earn")
  params.append("includePrePost", "false")
  params.append("includeAdjustedClose", "true")

  const url = `https://yahoo-finance-real-time1.p.rapidapi.com/stock/get-chart?${params.toString()}`

  console.log(`\nFetching: ${url}\n`)

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY || "",
        "x-rapidapi-host": "yahoo-finance-real-time1.p.rapidapi.com",
      },
    })

    console.log(`Status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      console.error("❌ API Error:", response.status)
      const text = await response.text()
      console.error("Response:", text)
      return
    }

    const data = await response.json()

    console.log("\n📊 Response structure:")
    console.log("- Has chart?", !!data.chart)
    console.log("- Has result?", !!data.chart?.result)
    console.log("- Result length:", data.chart?.result?.length || 0)

    if (data.chart?.result?.[0]) {
      const result = data.chart.result[0]
      console.log("\n📈 Chart data:")
      console.log("- Symbol:", result.meta?.symbol)
      console.log("- Timestamps:", result.timestamp?.length || 0)
      console.log("- First timestamp:", result.timestamp?.[0])
      console.log("- Last timestamp:", result.timestamp?.[result.timestamp?.length - 1])

      const closes = result.indicators?.quote?.[0]?.close
      console.log("- Close prices:", closes?.length || 0)
      console.log("- First close:", closes?.[0])
      console.log("- Last close:", closes?.[closes?.length - 1])
      console.log("- Sample closes (first 5):", closes?.slice(0, 5))

      // Check for null/zero values
      const nullCount = closes?.filter((c: any) => c === null || c === undefined).length || 0
      const zeroCount = closes?.filter((c: any) => c === 0).length || 0
      console.log("\n⚠️  Data quality:")
      console.log("- Null values:", nullCount)
      console.log("- Zero values:", zeroCount)

      if (nullCount > 0 || zeroCount > 0) {
        console.log("\n❌ WARNING: SPX data contains nulls or zeros!")
      } else {
        console.log("\n✅ SPX data looks good!")
      }
    } else {
      console.log("\n❌ No chart result found")
      console.log("Full response:", JSON.stringify(data, null, 2))
    }

  } catch (error) {
    console.error("❌ Error:", error)
  }
}

testSPX()
