import dotenv from "dotenv"
import { resolve } from "path"

dotenv.config({ path: resolve(__dirname, "../.env") })

async function testGSPC() {
  console.log("Testing ^GSPC (S&P 500 Index)...")

  const params = new URLSearchParams({
    symbol: "^GSPC",
    region: "US",
    period1: "2024-11-04",
    period2: "2025-11-04",
    interval: "1d",
  })

  const url = `https://yahoo-finance-real-time1.p.rapidapi.com/stock/get-chart?${params.toString()}`

  console.log(`URL: ${url}\n`)

  const response = await fetch(url, {
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY || "",
      "x-rapidapi-host": "yahoo-finance-real-time1.p.rapidapi.com",
    },
  })

  console.log(`Status: ${response.status}\n`)

  const data = await response.json()

  if (data.chart?.result?.[0]) {
    const result = data.chart.result[0]
    console.log("✅ ^GSPC Data Found!")
    console.log("- Symbol:", result.meta?.symbol)
    console.log("- Instrument Type:", result.meta?.instrumentType)
    console.log("- Timestamps:", result.timestamp?.length || 0)
    console.log("- Close prices:", result.indicators?.quote?.[0]?.close?.length || 0)
    console.log("- First close:", result.indicators?.quote?.[0]?.close?.[0])
    console.log("- Last close:", result.indicators?.quote?.[0]?.close?.slice(-1)[0])
  } else {
    console.log("❌ No data for ^GSPC")
    console.log(JSON.stringify(data, null, 2))
  }
}

testGSPC()
