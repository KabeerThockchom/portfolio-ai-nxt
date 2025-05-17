import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const region = searchParams.get("region") || "US"

    if (!symbol) {
      return NextResponse.json({ success: false, error: "Symbol is required" }, { status: 400 })
    }

    const params = new URLSearchParams()
    params.append("symbol", symbol)
    params.append("region", region)

    const url = `https://yahoo-finance-real-time1.p.rapidapi.com/stock/get-profile?${params.toString()}`
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

    return NextResponse.json({
      success: true,
      profileData: result,
    })
  } catch (error: any) {
    console.error("Error fetching stock profile:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
