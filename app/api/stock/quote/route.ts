import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol") || "unknown"

  try {
    const region = searchParams.get("region") || "US"

    if (!searchParams.get("symbol")) {
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

    // Check for API error response
    if (data.quoteResponse?.error) {
      console.error(`Yahoo Finance API error for ${symbol}:`, data.quoteResponse.error)
      return NextResponse.json(
        { success: false, error: data.quoteResponse.error.description || "API error" },
        { status: 400 }
      )
    }

    // Extract quote data from quoteResponse
    const quote = data?.quoteResponse?.result?.[0]

    if (!quote) {
      console.error(`No quote data returned for ${symbol}`)
      return NextResponse.json(
        { success: false, error: `No data available for ${symbol}` },
        { status: 404 }
      )
    }

    const price = quote.regularMarketPrice

    if (!price) {
      console.error(`No valid price found for ${symbol}`)
      return NextResponse.json(
        { success: false, error: `Could not fetch price for ${symbol}` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        symbol: quote.symbol || symbol,
        price: price,
        currency: quote.currency || "USD",
        shortName: quote.shortName || symbol,
        longName: quote.longName || symbol,
      },
    })
  } catch (error) {
    console.error(`Error fetching stock quote for ${searchParams.get("symbol")}:`, error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch stock quote"
    console.error(`Error details: ${errorMessage}`)
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
