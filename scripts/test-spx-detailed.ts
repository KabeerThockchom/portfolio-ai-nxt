import dotenv from "dotenv"
import { resolve } from "path"

dotenv.config({ path: resolve(__dirname, "../.env") })

async function testSPX() {
  const params = new URLSearchParams({
    symbol: "SPX",
    region: "US",
    period1: "2024-11-04",
    period2: "2025-11-04",
    interval: "1d",
  })

  const url = `https://yahoo-finance-real-time1.p.rapidapi.com/stock/get-chart?${params.toString()}`

  const response = await fetch(url, {
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY || "",
      "x-rapidapi-host": "yahoo-finance-real-time1.p.rapidapi.com",
    },
  })

  const data = await response.json()
  console.log("Full SPX Response:")
  console.log(JSON.stringify(data, null, 2))
}

testSPX()
