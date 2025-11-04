import { db, getDb, closeDb } from "./connection.js"
import { users } from "./schema.js"

/**
 * Seed demo users into the database
 * Run this script: npx ts-node lib/db/seed-users.ts
 */
async function seedUsers() {
  console.log("Starting user seeding...")

  try {
    // Get raw database connection for checking existing users
    const rawDb = getDb()

    // Check if users already exist
    const existingUsers = rawDb.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }

    if (existingUsers.count > 0) {
      console.log(`Database already has ${existingUsers.count} users. Skipping seed.`)
      console.log("To re-seed, delete data/portfolio.sqlite3 or clear the users table first.")
      closeDb()
      return
    }

    // Insert demo users
    const demoUsers = [
      {
        userId: 1,
        name: "John Doe",
        username: "johndoe",
        email: "john.doe@ey.com",
        password: "password123", // Plain text as per requirement
        dob: "1990-01-01",
        phoneNumber: "12345678901",
      },
      {
        userId: 2,
        name: "Jane Smith",
        username: "janesmith",
        email: "jane.smith@ey.com",
        password: "password123",
        dob: "1992-05-15",
        phoneNumber: "12345678902",
      },
      {
        userId: 3,
        name: "Bob Johnson",
        username: "bobjohnson",
        email: "bob.johnson@ey.com",
        password: "password123",
        dob: "1988-11-23",
        phoneNumber: "12345678903",
      },
    ]

    await db.insert(users).values(demoUsers)

    console.log("✓ Successfully seeded 3 demo users:")
    demoUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - User ID: ${user.userId}`)
    })

    console.log("\nDemo credentials:")
    console.log("  Email: john.doe@ey.com")
    console.log("  Password: password123")

  } catch (error) {
    console.error("Error seeding users:", error)
    throw error
  } finally {
    closeDb()
  }
}

// Run the seed function
seedUsers()
  .then(() => {
    console.log("\n✓ User seeding completed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n✗ User seeding failed:", error)
    process.exit(1)
  })
