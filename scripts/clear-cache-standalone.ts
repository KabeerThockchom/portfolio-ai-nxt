import dotenv from "dotenv"
import { resolve } from "path"
import { createClient } from "@libsql/client"

// Load environment variables FIRST
dotenv.config({ path: resolve(__dirname, "../.env") })

async function main() {
  console.log("Clearing SPX cache...")
  console.log("Database URL:", process.env.TURSO_DATABASE_URL ? "✅ Loaded" : "❌ Missing")
  console.log("Auth Token:", process.env.TURSO_AUTH_TOKEN ? "✅ Loaded" : "❌ Missing")

  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error("❌ Missing database credentials in .env file")
    process.exit(1)
  }

  try {
    // Create Turso client directly
    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })

    // Clear SPX cache
    const result = await turso.execute({
      sql: "DELETE FROM price_cache WHERE symbol = ?",
      args: ["SPX"],
    })

    console.log(`✅ Successfully cleared ${result.rowsAffected} SPX cache entries`)
    console.log("Next benchmark request will fetch fresh data from Yahoo Finance API")
  } catch (error) {
    console.error("❌ Error clearing cache:", error)
    process.exit(1)
  }
}

main()
