import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const HISTORY_FILE = path.join(process.cwd(), "data", "session_history.md");

export async function POST(request: Request) {
  try {
    const { role, message } = await request.json();

    if (!role || !message) {
      return NextResponse.json({ error: "Role and message are required" }, { status: 400 });
    }

    // Ensure data directory exists
    const dataDir = path.dirname(HISTORY_FILE);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    // Format the message for markdown
    const timestamp = new Date().toLocaleString();
    const formattedMessage = `### ${role === "user" ? "User" : "Assistant"} (${timestamp})\n${message}\n\n`;

    // Append to file
    await fs.appendFile(HISTORY_FILE, formattedMessage, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving conversation:", error);
    return NextResponse.json({ error: "Failed to save conversation" }, { status: 500 });
  }
}
