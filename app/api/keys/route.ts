import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    rapidApiKey: process.env.RAPID_API_KEY || "",
  })
}
