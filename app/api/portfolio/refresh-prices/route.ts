import { NextResponse } from "next/server"
import { refreshAllHoldingsPrices } from "@/lib/services/price-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      )
    }

    // Get the base URL from the request to handle dynamic ports in development
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${protocol}://${host}`

    console.log(`[API] Refreshing prices for user ${userId}...`)

    // Refresh all holding prices
    const updatedCount = await refreshAllHoldingsPrices(userId, baseUrl)

    return NextResponse.json({
      success: true,
      data: {
        message: `Successfully updated ${updatedCount} prices`,
        updatedCount,
      },
    })
  } catch (error) {
    console.error("Error refreshing prices:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to refresh prices",
      },
      { status: 500 }
    )
  }
}
