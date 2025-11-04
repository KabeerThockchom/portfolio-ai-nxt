import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import {
  userPortfolio,
  assetType,
  assetSector,
  assetClassRiskLevelMapping,
} from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type {
  RiskAnalysisRequest,
  RiskAnalysisResponse,
  RiskAnalysisResult,
  BubbleChartData,
  GaugeChartData,
} from "@/types/portfolio"
import { getCurrentPrice } from "@/lib/services/price-service"

export async function POST(request: Request) {
  try {
    const body: RiskAnalysisRequest = await request.json()
    const { userId, dimension } = body

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

    // Get all portfolio holdings with asset details
    const holdings = await db
      .select()
      .from(userPortfolio)
      .where(eq(userPortfolio.userId, userId))
      .leftJoin(assetType, eq(userPortfolio.assetId, assetType.assetId))

    // Get all risk mappings for scoring
    const riskMappings = await db.select().from(assetClassRiskLevelMapping)

    // Enrich holdings with latest prices and risk scores
    const enrichedHoldings = await Promise.all(
      holdings.map(async ({ user_portfolio, asset_type }) => {
        if (!asset_type) return null

        // Fetch real-time price using price service (with baseUrl for dynamic ports)
        const latestClosePrice = await getCurrentPrice(asset_type.assetTicker, baseUrl)
        const currentAmount = user_portfolio.assetTotalUnits * latestClosePrice

        // Calculate risk score based on volatility and asset class
        const volatility = asset_type.oneYrVolatility || 0
        const assetClass = asset_type.assetClass || "Unknown"
        const concentration = asset_type.concentration || "Low"

        // Find matching risk mapping
        let riskScore = 5.0 // Default medium risk

        const mapping = riskMappings.find(
          (m) =>
            m.assetType === assetClass &&
            volatility >= m.volatilityRangeStart &&
            volatility <= m.volatilityRangeEnd &&
            (m.concentration === concentration || !m.concentration)
        )

        if (mapping) {
          riskScore = mapping.riskScore
          // Apply addons if available
          if (mapping.addon1) riskScore += mapping.addon1
          if (mapping.addon2) riskScore += mapping.addon2
        }

        return {
          ...user_portfolio,
          asset: asset_type,
          currentAmount,
          volatility,
          riskScore,
          concentration,
        }
      })
    )

    const validHoldings = enrichedHoldings.filter((h) => h !== null)

    // Aggregate risk analysis by dimension
    const riskMap = new Map<string, RiskAnalysisResult>()

    for (const holding of validHoldings) {
      let key: string = ""

      switch (dimension) {
        case "asset_class":
          key = holding.asset?.assetClass || "Unknown"
          break
        case "ticker":
          key = holding.asset?.assetTicker || "Unknown"
          break
        case "sector":
          // For sectors, distribute across sector breakdown
          const sectors = await db
            .select()
            .from(assetSector)
            .where(eq(assetSector.assetId, holding.asset?.assetId || 0))

          for (const sector of sectors) {
            const sectorKey = sector.sectorName
            const weightedValue =
              (holding.currentAmount || 0) * (sector.sectorWeightage / 100)
            const weightedRisk =
              (holding.riskScore || 0) * (sector.sectorWeightage / 100)

            if (riskMap.has(sectorKey)) {
              const existing = riskMap.get(sectorKey)!
              existing.investmentAmount += weightedValue
              existing.riskScore =
                (existing.riskScore * existing.investmentAmount +
                  weightedRisk * weightedValue) /
                (existing.investmentAmount + weightedValue)
            } else {
              riskMap.set(sectorKey, {
                dimension: "sector",
                label: sectorKey,
                investmentAmount: weightedValue,
                riskScore: weightedRisk,
                volatility: holding.volatility,
                concentration: holding.concentration,
              })
            }
          }
          continue
        default:
          // Default to asset class if no dimension specified
          key = holding.asset?.assetClass || "Unknown"
      }

      // Normal aggregation (non-sector)
      if (riskMap.has(key)) {
        const existing = riskMap.get(key)!
        const totalValue = existing.investmentAmount + (holding.currentAmount || 0)
        // Weighted average risk score
        existing.riskScore =
          (existing.riskScore * existing.investmentAmount +
            (holding.riskScore || 0) * (holding.currentAmount || 0)) /
          totalValue
        existing.investmentAmount = totalValue
        // Update volatility (weighted average)
        existing.volatility =
          ((existing.volatility || 0) * existing.investmentAmount +
            (holding.volatility || 0) * (holding.currentAmount || 0)) /
          totalValue
      } else {
        riskMap.set(key, {
          dimension: dimension || "asset_class",
          label: key,
          investmentAmount: holding.currentAmount || 0,
          riskScore: holding.riskScore || 0,
          volatility: holding.volatility,
          concentration: holding.concentration,
        })
      }
    }

    const analysis = Array.from(riskMap.values())

    // Calculate overall portfolio risk score (weighted average)
    const totalValue = analysis.reduce((sum, a) => sum + a.investmentAmount, 0)
    const overallRiskScore =
      totalValue > 0
        ? analysis.reduce(
            (sum, a) => sum + (a.riskScore * a.investmentAmount) / totalValue,
            0
          )
        : 5.0

    // Create bubble chart data
    const bubbleData: BubbleChartData[] = [
      {
        name: "Portfolio Risk",
        data: analysis.map((a) => ({
          x: a.label,
          y: a.investmentAmount,
          z: a.riskScore,
        })),
      },
    ]

    // Create gauge chart data
    const gaugeData: GaugeChartData = {
      value: Math.round(overallRiskScore * 10) / 10,
      min: 0,
      max: 10,
      label: "Portfolio Risk Score",
    }

    const response: RiskAnalysisResponse = {
      success: true,
      data: {
        analysis,
        overallRiskScore: Math.round(overallRiskScore * 10) / 10,
        chartData: {
          bubbleData,
          gaugeData,
        },
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error analyzing portfolio risk:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to analyze portfolio risk",
      },
      { status: 500 }
    )
  }
}
