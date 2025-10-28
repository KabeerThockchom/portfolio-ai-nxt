import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const region = searchParams.get("region") || "US"
    const lang = searchParams.get("lang") || "en-US"

    if (!symbol) {
      return NextResponse.json({ success: false, error: "Symbol is required" }, { status: 400 })
    }

    const params = new URLSearchParams()
    params.append("symbol", symbol)
    params.append("region", region)

    // Add modules parameter to request specific financial data
    const modules = "incomeStatementHistory,incomeStatementHistoryQuarterly,balanceSheetHistory,balanceSheetHistoryQuarterly,cashflowStatementHistory,cashflowStatementHistoryQuarterly"
    params.append("modules", modules)

    // Use the stock/v2/get-financials endpoint with modules
    const url = `https://yahoo-finance-real-time1.p.rapidapi.com/stock/v2/get-financials?${params.toString()}`
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

    // Log the structure to help debug
    console.log("Financials API response structure:", JSON.stringify(Object.keys(result || {})))
    console.log("Has quoteSummary:", !!result?.quoteSummary)

    // Extract the financial data from quoteSummary response structure
    const financialsData = result?.quoteSummary?.result?.[0] || result
    console.log("Extracted financials data keys:", JSON.stringify(Object.keys(financialsData || {})))

    return NextResponse.json({
      success: true,
      financialsData,
    })
  } catch (error: any) {
    console.error("Error fetching stock financials:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
