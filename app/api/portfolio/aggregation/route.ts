import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import {
  userPortfolio,
  assetType,
  assetHistory,
  assetSector,
  userAccounts,
} from "@/lib/db/schema"
import { eq, and, desc, sql } from "drizzle-orm"
import type {
  PortfolioAggregation,
  PortfolioAggregationRequest,
  PortfolioAggregationResponse,
  DonutChartData,
} from "@/types/portfolio"

// Helper function to generate shades of a base color
function generateColorShades(baseColor: string, count: number): string[] {
  const colors: string[] = []
  const hslMatch = baseColor.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/)

  if (hslMatch) {
    const [, h, s, l] = hslMatch
    const hue = parseInt(h)
    const sat = parseFloat(s)
    const light = parseFloat(l)

    for (let i = 0; i < count; i++) {
      const newLight = Math.max(20, Math.min(80, light + (i - count / 2) * 10))
      colors.push(`hsl(${hue}, ${sat}%, ${newLight}%)`)
    }
  } else {
    // Fallback to default colors if parsing fails
    const defaultColors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
    ]
    for (let i = 0; i < count; i++) {
      colors.push(defaultColors[i % defaultColors.length])
    }
  }

  return colors
}

export async function POST(request: Request) {
  try {
    const body: PortfolioAggregationRequest = await request.json()
    const { userId, dimension, metric, multiLevel } = body

    if (!userId || !dimension || !metric) {
      return NextResponse.json(
        {
          success: false,
          error: "userId, dimension, and metric are required",
        },
        { status: 400 }
      )
    }

    // Get all portfolio holdings with asset details
    const holdings = await db
      .select()
      .from(userPortfolio)
      .where(eq(userPortfolio.userId, userId))
      .leftJoin(assetType, eq(userPortfolio.assetId, assetType.assetId))

    // Enrich with latest prices
    const enrichedHoldings = await Promise.all(
      holdings.map(async ({ user_portfolio, asset_type }) => {
        if (!asset_type) return null

        const latestPriceRecord = await db
          .select()
          .from(assetHistory)
          .where(eq(assetHistory.assetId, asset_type.assetId))
          .orderBy(desc(assetHistory.date))
          .limit(1)

        const latestClosePrice = latestPriceRecord[0]?.closePrice || 0
        const currentAmount = user_portfolio.assetTotalUnits * latestClosePrice
        const gainLoss = currentAmount - user_portfolio.investmentAmount
        const gainLossPercent =
          user_portfolio.investmentAmount > 0
            ? (gainLoss / user_portfolio.investmentAmount) * 100
            : 0

        return {
          ...user_portfolio,
          asset: asset_type,
          currentAmount,
          gainLossPercent,
        }
      })
    )

    const validHoldings = enrichedHoldings.filter((h) => h !== null)

    // Get total cash from all user accounts
    const accounts = await db
      .select()
      .from(userAccounts)
      .where(eq(userAccounts.userId, userId))

    const totalCash = accounts.reduce((sum, acc) => sum + acc.cashBalance, 0)

    // Aggregate by dimension
    let aggregationMap = new Map<string, PortfolioAggregation>()

    for (const holding of validHoldings) {
      let key: string = ""

      switch (dimension) {
        case "asset_class":
          key = holding.asset?.assetClass || "Unknown"
          break
        case "ticker":
          key = holding.asset?.assetTicker || "Unknown"
          break
        case "asset_manager":
          key = holding.asset?.assetManager || "Unknown"
          break
        case "category":
          key = holding.asset?.category || "Unknown"
          break
        case "concentration":
          key = holding.asset?.concentration || "Unknown"
          break
        case "sector":
          // For sectors, we need to fetch sector breakdown
          const sectors = await db
            .select()
            .from(assetSector)
            .where(eq(assetSector.assetId, holding.asset?.assetId || 0))

          // Distribute holding value across sectors based on weightage
          for (const sector of sectors) {
            const sectorKey = sector.sectorName
            const weightedValue =
              (holding.currentAmount || 0) * (sector.sectorWeightage / 100)
            const weightedReturn =
              (holding.gainLossPercent || 0) * (sector.sectorWeightage / 100)

            if (aggregationMap.has(sectorKey)) {
              const existing = aggregationMap.get(sectorKey)!
              existing.totalValue += weightedValue
              existing.percentageReturn =
                ((existing.percentageReturn || 0) + weightedReturn) /
                (existing.count! + 1)
              existing.count! += 1
            } else {
              aggregationMap.set(sectorKey, {
                dimension: "sector",
                label: sectorKey,
                totalValue: weightedValue,
                percentageReturn: weightedReturn,
                count: 1,
              })
            }
          }
          continue // Skip the normal aggregation below
      }

      // Normal aggregation (non-sector)
      if (dimension !== "sector") {
        if (aggregationMap.has(key)) {
          const existing = aggregationMap.get(key)!
          existing.totalValue += holding.currentAmount || 0
          existing.percentageReturn =
            ((existing.percentageReturn || 0) + (holding.gainLossPercent || 0)) /
            (existing.count! + 1)
          existing.count! += 1
        } else {
          aggregationMap.set(key, {
            dimension,
            label: key,
            totalValue: holding.currentAmount || 0,
            percentageReturn: holding.gainLossPercent || 0,
            count: 1,
          })
        }
      }
    }

    let aggregation = Array.from(aggregationMap.values())

    // Add cash to aggregation (only for asset_class dimension)
    // Only add if Cash doesn't already exist (to avoid duplicates from user_portfolio)
    if (dimension === "asset_class" && totalCash > 0) {
      const existingCash = aggregation.find((a) => a.label === "Cash")
      if (!existingCash) {
        // No cash in portfolio, add it from accounts
        aggregation.push({
          dimension: "asset_class",
          label: "Cash",
          totalValue: totalCash,
          percentageReturn: 0, // Cash has no return
          count: accounts.length,
        })
      }
      // If Cash already exists from user_portfolio, don't add from accounts (avoid double-counting)
    }

    // Multi-level aggregation for donut charts (asset class -> sectors)
    if (multiLevel && dimension === "asset_class") {
      const multiLevelAgg: PortfolioAggregation[] = []

      for (const assetClassAgg of aggregation) {
        // Skip sector breakdown for cash (cash has no sectors)
        if (assetClassAgg.label === "Cash") {
          multiLevelAgg.push(assetClassAgg)
          continue
        }

        const children: PortfolioAggregation[] = []

        // Get all holdings for this asset class
        const assetClassHoldings = validHoldings.filter(
          (h) => h.asset?.assetClass === assetClassAgg.label
        )

        // Aggregate by sector within this asset class
        const sectorMap = new Map<string, PortfolioAggregation>()

        for (const holding of assetClassHoldings) {
          const sectors = await db
            .select()
            .from(assetSector)
            .where(eq(assetSector.assetId, holding.asset?.assetId || 0))

          for (const sector of sectors) {
            const sectorKey = sector.sectorName
            const weightedValue =
              (holding.currentAmount || 0) * (sector.sectorWeightage / 100)

            if (sectorMap.has(sectorKey)) {
              const existing = sectorMap.get(sectorKey)!
              existing.totalValue += weightedValue
            } else {
              sectorMap.set(sectorKey, {
                dimension: "sector",
                label: sectorKey,
                totalValue: weightedValue,
                count: 1,
              })
            }
          }
        }

        multiLevelAgg.push({
          ...assetClassAgg,
          children: Array.from(sectorMap.values()),
        })
      }

      aggregation.length = 0
      aggregation.push(...multiLevelAgg)
    }

    // Define color mapping for asset classes
    const assetClassColors: Record<string, string> = {
      "Cash": "#FFE600",      // EY Yellow for cash
      "Stock": "#FFFFFF",     // White for stocks
      "Bond": "#999999",      // Medium gray for bonds
      "ETF": "#CCCCCC",       // Light gray for ETFs
      "Mutual Fund": "#666666", // Darker gray for mutual funds
    }

    // Create chart data with proper colors
    const chartData: DonutChartData = {
      labels: aggregation.map((a) => a.label),
      series:
        metric === "total_value"
          ? aggregation.map((a) => a.totalValue)
          : aggregation.map((a) => a.percentageReturn || 0),
      colors: aggregation.map((a) => assetClassColors[a.label] || "#B3B3B3"),
    }

    const response: PortfolioAggregationResponse = {
      success: true,
      data: {
        aggregation,
        chartData,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error aggregating portfolio:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to aggregate portfolio",
      },
      { status: 500 }
    )
  }
}
