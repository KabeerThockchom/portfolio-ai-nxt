import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const HISTORY_FILE = path.join(process.cwd(), "data", "session_history.md");

export async function POST() {
  try {
    // Check if file exists
    try {
      await fs.access(HISTORY_FILE);
      // Delete the file
      await fs.unlink(HISTORY_FILE);
    } catch {
      // File doesn't exist, nothing to delete
    }

    return NextResponse.json({ success: true, message: "Conversation history cleared" });
  } catch (error) {
    console.error("Error clearing conversation:", error);
    return NextResponse.json({ error: "Failed to clear conversation" }, { status: 500 });
  }
}
