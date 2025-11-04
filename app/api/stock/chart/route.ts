import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const region = searchParams.get("region") || "US"
    const comparisons = searchParams.get("comparisons")
    const range = searchParams.get("range")
    const interval = searchParams.get("interval") || "1d"
    const events = searchParams.get("events") || "div,split,earn"
    const includePrePost = searchParams.get("includePrePost") || "false"
    const includeAdjustedClose = searchParams.get("includeAdjustedClose") || "true"
    const period1 = searchParams.get("period1") // Unix timestamp (start)
    const period2 = searchParams.get("period2") // Unix timestamp (end)

    if (!symbol) {
      return NextResponse.json({ success: false, error: "Symbol is required" }, { status: 400 })
    }

    // Build query parameters
    const params = new URLSearchParams()
    params.append("symbol", symbol)
    params.append("region", region)
    if (comparisons) params.append("comparisons", comparisons)

    // Use custom period OR range (period takes priority)
    if (period1 && period2) {
      params.append("period1", period1)
      params.append("period2", period2)
    } else {
      params.append("range", range || "1mo")
    }

    params.append("interval", interval)
    params.append("events", events)
    params.append("includePrePost", includePrePost)
    params.append("includeAdjustedClose", includeAdjustedClose)

    const url = `https://yahoo-finance-real-time1.p.rapidapi.com/stock/get-chart?${params.toString()}`
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY || "",
        "x-rapidapi-host": "yahoo-finance-real-time1.p.rapidapi.com",
      },
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const result = await response.json()

    // Check for API errors
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      chartData: result,
    })
  } catch (error: any) {
    console.error("Error fetching stock chart:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
