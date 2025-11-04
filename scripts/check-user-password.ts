import { createClient } from "@libsql/client"
import * as dotenv from "dotenv"

dotenv.config()

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

async function checkUser() {
  try {
    const result = await turso.execute("SELECT user_id, name, email, username, password FROM users;")
    console.log("User credentials in Turso database:")
    console.log(JSON.stringify(result.rows, null, 2))
  } catch (error) {
    console.error("Error:", error)
  }
}

checkUser()
