import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "./schema"
import path from "path"

// Get the database path
const dbPath = path.join(process.cwd(), "data", "portfolio.sqlite3")

// Create SQLite connection
let sqlite: Database.Database | null = null

function getConnection(): Database.Database {
  if (!sqlite) {
    sqlite = new Database(dbPath, {
      // Enable verbose mode for debugging (optional)
      // verbose: console.log,
    })
    // Enable foreign keys
    sqlite.pragma("foreign_keys = ON")
  }
  return sqlite
}

// Create Drizzle instance with schema
export const db = drizzle(getConnection(), { schema })

// Export connection for direct SQL queries if needed
export const getDb = () => getConnection()

// Close connection (useful for cleanup in tests or scripts)
export function closeDb() {
  if (sqlite) {
    sqlite.close()
    sqlite = null
  }
}
