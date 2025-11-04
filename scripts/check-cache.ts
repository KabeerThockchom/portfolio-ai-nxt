import dotenv from "dotenv"
import { resolve } from "path"
import { createClient } from "@libsql/client"

// Load environment variables FIRST
dotenv.config({ path: resolve(__dirname, "../.env") })

async function main() {
  console.log("Checking price cache contents...")

  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error("❌ Missing database credentials")
    process.exit(1)
  }

  try {
    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })

    // Get distinct symbols in cache
    const symbols = await turso.execute({
      sql: "SELECT DISTINCT symbol, COUNT(*) as count, MAX(cached_at) as latest FROM price_cache GROUP BY symbol ORDER BY symbol",
      args: [],
    })

    console.log("\n📊 Cache contents:")
    console.log("==================")
    for (const row of symbols.rows) {
      console.log(`${row.symbol}: ${row.count} records (latest: ${row.latest})`)
    }

    // Check specifically for SPX
    const spxData = await turso.execute({
      sql: "SELECT * FROM price_cache WHERE symbol = ? LIMIT 5",
      args: ["SPX"],
    })

    console.log("\n🔍 SPX cache sample:")
    console.log("==================")
    if (spxData.rows.length === 0) {
      console.log("❌ No SPX data found in cache")
    } else {
      console.log(spxData.rows)
    }

  } catch (error) {
    console.error("❌ Error checking cache:", error)
    process.exit(1)
  }
}

main()
