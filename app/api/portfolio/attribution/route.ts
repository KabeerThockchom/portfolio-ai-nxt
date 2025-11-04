import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import {
  userPortfolio,
  assetType,
  assetSector,
} from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type {
  ReturnsAttributionRequest,
  ReturnsAttributionResponse,
} from "@/types/portfolio"
import { getHistoricalPrices } from "@/lib/services/price-service"

// Helper to get price at a specific date or closest before from price array
function getPriceAtDate(
  prices: Array<{ date: string; closePrice: number }>,
  targetDate: Date
): number | null {
  const targetDateStr = targetDate.toISOString().split("T")[0]

  // Filter prices on or before target date
  const validPrices = prices.filter(p => p.date <= targetDateStr)

  if (validPrices.length === 0) {
    return null
  }

  // Return the closest (most recent) price
  return validPrices[validPrices.length - 1].closePrice
}

// Helper to calculate date range based on period
function getDateRange(period: string): { startDate: Date; endDate: Date } {
  const endDate = new Date()
  const startDate = new Date()

  switch (period) {
    case "1m":
      startDate.setMonth(startDate.getMonth() - 1)
      break
    case "3m":
      startDate.setMonth(startDate.getMonth() - 3)
      break
    case "6m":
      startDate.setMonth(startDate.getMonth() - 6)
      break
    case "1y":
      startDate.setFullYear(startDate.getFullYear() - 1)
      break
    case "2y":
      startDate.setFullYear(startDate.getFullYear() - 2)
      break
    case "3y":
      startDate.setFullYear(startDate.getFullYear() - 3)
      break
    case "5y":
      startDate.setFullYear(startDate.getFullYear() - 5)
      break
    default:
      startDate.setFullYear(startDate.getFullYear() - 1)
  }

  return { startDate, endDate }
}

export async function POST(request: Request) {
  try {
    const body: ReturnsAttributionRequest = await request.json()
    const { userId, dimension, period = "1y" } = body

    if (!userId || !dimension) {
      return NextResponse.json(
        { success: false, error: "userId and dimension are required" },
        { status: 400 }
      )
    }

    // Get the base URL from the request to handle dynamic ports in development
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${protocol}://${host}`

    const { startDate, endDate } = getDateRange(period)

    // Get current holdings
    const holdings = await db
      .select()
      .from(userPortfolio)
      .where(eq(userPortfolio.userId, userId))
      .leftJoin(assetType, eq(userPortfolio.assetId, assetType.assetId))

    // Fetch historical prices for all holdings upfront (with caching)
    const startDateStr = startDate.toISOString().split("T")[0]
    const endDateStr = endDate.toISOString().split("T")[0]

    // Create price map: symbol -> prices array
    const priceMap = new Map<string, Array<{ date: string; closePrice: number }>>()

    await Promise.all(
      holdings.map(async ({ asset_type }) => {
        if (!asset_type) return

        const prices = await getHistoricalPrices(
          asset_type.assetTicker,
          startDateStr,
          endDateStr,
          baseUrl
        )
        priceMap.set(asset_type.assetTicker, prices)
      })
    )

    // Calculate total portfolio value at start and end
    let totalStartValue = 0
    let totalEndValue = 0

    const enrichedHoldings = holdings.map(({ user_portfolio, asset_type }) => {
        if (!asset_type) return null

        const prices = priceMap.get(asset_type.assetTicker) || []
        const startPrice = getPriceAtDate(prices, startDate)
        const endPrice = getPriceAtDate(prices, endDate)

        if (!startPrice || !endPrice) return null

        const startValue = user_portfolio.assetTotalUnits * startPrice
        const endValue = user_portfolio.assetTotalUnits * endPrice
        const absoluteReturn = endValue - startValue
        const percentReturn = (absoluteReturn / startValue) * 100

        totalStartValue += startValue
        totalEndValue += endValue

        return {
          asset: asset_type,
          units: user_portfolio.assetTotalUnits,
          startValue,
          endValue,
          absoluteReturn,
          percentReturn,
        }
      })

    const validHoldings = enrichedHoldings.filter((h) => h !== null)
    const totalReturn = totalEndValue - totalStartValue

    // Aggregate by dimension
    const attributionMap = new Map()

    for (const holding of validHoldings) {
      if (dimension === "sector") {
        // For sectors, distribute across sector breakdown
        const sectors = await db
          .select()
          .from(assetSector)
          .where(eq(assetSector.assetId, holding.asset.assetId))

        for (const sector of sectors) {
          const sectorKey = sector.sectorName
          const weightedContribution =
            holding.absoluteReturn * (sector.sectorWeightage / 100)
          const weightedValue = holding.endValue * (sector.sectorWeightage / 100)

          if (attributionMap.has(sectorKey)) {
            const existing = attributionMap.get(sectorKey)
            existing.contribution += weightedContribution
            existing.endValue += weightedValue
          } else {
            attributionMap.set(sectorKey, {
              dimension: "sector",
              label: sectorKey,
              contribution: weightedContribution,
              endValue: weightedValue,
            })
          }
        }
      } else {
        let key = ""
        switch (dimension) {
          case "asset_class":
            key = holding.asset.assetClass || "Unknown"
            break
          case "ticker":
            key = holding.asset.assetTicker || "Unknown"
            break
          default:
            key = holding.asset.assetClass || "Unknown"
        }

        if (attributionMap.has(key)) {
          const existing = attributionMap.get(key)
          existing.contribution += holding.absoluteReturn
          existing.endValue += holding.endValue
        } else {
          attributionMap.set(key, {
            dimension,
            label: key,
            contribution: holding.absoluteReturn,
            endValue: holding.endValue,
          })
        }
      }
    }

    const attribution = Array.from(attributionMap.values()).map((item) => ({
      ...item,
      // Normalize contribution as percentage of total portfolio return
      normalizedReturn:
        totalReturn !== 0 ? (item.contribution / totalReturn) * 100 : 0,
      contribution: Math.round(item.contribution * 100) / 100,
    }))

    // Sort by contribution (highest positive to lowest)
    attribution.sort((a, b) => b.contribution - a.contribution)

    // Create waterfall chart data
    const chartData = {
      categories: [...attribution.map((a) => a.label), "Total Return"],
      data: [
        ...attribution.map((a) => a.contribution),
        Math.round(totalReturn * 100) / 100,
      ],
    }

    const response: ReturnsAttributionResponse = {
      success: true,
      data: {
        attribution,
        totalReturn: Math.round(totalReturn * 100) / 100,
        chartData,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error calculating returns attribution:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to calculate returns attribution",
      },
      { status: 500 }
    )
  }
}
