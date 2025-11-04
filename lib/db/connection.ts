import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"

// Create Turso client
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

// Create Drizzle instance with schema
export const db = drizzle(turso, { schema })

// Export Turso client for direct queries if needed
export const getTursoClient = () => turso

// Close connection (useful for cleanup in tests or scripts)
export function closeDb() {
  // Turso client doesn't require explicit cleanup
  // Connection is managed automatically
}
