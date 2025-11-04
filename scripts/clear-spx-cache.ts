import dotenv from "dotenv"
import { resolve } from "path"

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, "../.env") })

// Import after loading env vars
import { clearAllCache } from "@/lib/services/price-service"

async function main() {
  console.log("Clearing SPX cache...")
  console.log("Database URL:", process.env.TURSO_DATABASE_URL ? "✅ Loaded" : "❌ Missing")

  try {
    await clearAllCache("SPX")
    console.log("✅ Successfully cleared SPX cache")
    console.log("Next benchmark request will fetch fresh data from Yahoo Finance API")
  } catch (error) {
    console.error("❌ Error clearing cache:", error)
    process.exit(1)
  }
}

main()
