import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const region = searchParams.get("region") || "US"

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: "Symbol parameter is required" },
        { status: 400 }
      )
    }

    // Special handling for CASH - not a tradeable asset
    if (symbol === "CASH") {
      return NextResponse.json({
        success: true,
        data: {
          symbol: "CASH",
          price: 1.0,
          currency: "USD",
        },
      })
    }

    // Check if API key is available
    if (!process.env.RAPID_API_KEY) {
      console.error("RAPID_API_KEY environment variable is not set")
      return NextResponse.json(
        { success: false, error: "API key not configured" },
        { status: 500 }
      )
    }

    // Fetch current stock price from Yahoo Finance using get-quotes endpoint
    const url = `https://yahoo-finance-real-time1.p.rapidapi.com/market/get-quotes?region=${region}&symbols=${symbol}`
    console.log(`Fetching quote for ${symbol} from: ${url}`)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "yahoo-finance-real-time1.p.rapidapi.com",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Yahoo Finance API error for ${symbol}: ${response.status} - ${errorText}`)
      return NextResponse.json(
        { success: false, error: `API returned ${response.status}: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`Quote data for ${symbol}:`, JSON.stringify(data).substring(0, 200))

    // Extract regular market price from quoteResponse
    const quote = data?.quoteResponse?.result?.[0]
    const price = quote?.regularMarketPrice

    if (!price) {
      return NextResponse.json(
        { success: false, error: `Could not fetch price for ${symbol}` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        symbol: quote.symbol,
        price: price,
        currency: quote.currency || "USD",
        shortName: quote.shortName || symbol,
        longName: quote.longName || symbol,
      },
    })
  } catch (error) {
    console.error("Error fetching stock quote:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch stock quote",
      },
      { status: 500 }
    )
  }
}
