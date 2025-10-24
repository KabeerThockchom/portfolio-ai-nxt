import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period1 = searchParams.get("period1"); // Start date YYYY-MM-DD
    const period2 = searchParams.get("period2"); // End date YYYY-MM-DD
    const region = searchParams.get("region") || "US";
    const lang = searchParams.get("lang") || "en-US";
    const size = searchParams.get("size") || "100";
    const offset = searchParams.get("offset") || "0";
    const sortField = searchParams.get("sortField") || "startdatetime";
    const sortType = searchParams.get("sortType") || "ASC";

    const rapidApiKey = process.env.RAPID_API_KEY;
    if (!rapidApiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Build URL with all required fields
    // The Yahoo Finance API doesn't properly handle includeFields via URLSearchParams
    // So we'll manually construct the URL with the fields we need
    const baseUrl = "https://yahoo-finance-real-time1.p.rapidapi.com/calendar/get-events";

    const queryParts = [
      `entityIdType=earnings`,
      `region=${region}`,
      `lang=${lang}`,
      `size=${size}`,
      `offset=${offset}`,
      `sortField=${sortField}`,
      `sortType=${sortType}`,
    ];

    // Add date range if provided
    if (period1) queryParts.push(`period1=${period1}`);
    if (period2) queryParts.push(`period2=${period2}`);

    const url = `${baseUrl}?${queryParts.join('&')}`;

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
        { error: `Failed to fetch earnings calendar: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      earningsCalendarData: data,
    });
  } catch (error) {
    console.error("Error fetching earnings calendar:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}
