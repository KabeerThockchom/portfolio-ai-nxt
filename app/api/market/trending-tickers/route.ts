import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") || "US";
    const lang = searchParams.get("lang") || "en-US";

    const rapidApiKey = process.env.RAPID_API_KEY;
    if (!rapidApiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const url = `https://yahoo-finance-real-time1.p.rapidapi.com/market/get-trending-tickers?region=${region}&lang=${lang}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "yahoo-finance-real-time1.p.rapidapi.com",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Yahoo Finance API Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Failed to fetch trending tickers: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      trendingTickersData: data,
    });
  } catch (error) {
    console.error("Error fetching trending tickers:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}
