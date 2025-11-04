import { db } from "@/lib/db/connection"
import { assetType, assetSector, userPortfolio } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

async function testSectors() {
  console.log("=== Testing Sector Data ===\n")

  // Get all portfolio holdings for user 1
  const holdings = await db
    .select()
    .from(userPortfolio)
    .where(eq(userPortfolio.userId, 1))
    .leftJoin(assetType, eq(userPortfolio.assetId, assetType.assetId))

  console.log(`Found ${holdings.length} holdings for user 1\n`)

  for (const holding of holdings) {
    const { user_portfolio, asset_type } = holding

    if (!asset_type) {
      console.log(`⚠️  No asset type found for portfolio ID ${user_portfolio.userPortId}`)
      continue
    }

    console.log(`\n📊 ${asset_type.assetTicker} (${asset_type.assetName})`)
    console.log(`   Asset ID: ${asset_type.assetId}`)
    console.log(`   Asset Class: ${asset_type.assetClass}`)

    // Query sectors for this asset
    const sectors = await db
      .select()
      .from(assetSector)
      .where(eq(assetSector.assetId, asset_type.assetId))

    if (sectors.length === 0) {
      console.log(`   ❌ No sectors found`)
    } else {
      console.log(`   ✅ Found ${sectors.length} sectors:`)
      sectors.forEach((sector) => {
        console.log(`      - ${sector.sectorName}: ${sector.sectorWeightage}%`)
      })
    }
  }

  console.log("\n=== Summary ===")
  const allSectors = await db.select().from(assetSector)
  console.log(`Total sectors in database: ${allSectors.length}`)

  process.exit(0)
}

testSectors().catch((error) => {
  console.error("Error:", error)
  process.exit(1)
})
