import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const HISTORY_FILE = path.join(process.cwd(), "data", "session_history.md");
const MAX_MESSAGES = 30; // Last 30 messages (15 user + 15 assistant exchanges)

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export async function GET() {
  try {
    // Check if file exists
    try {
      await fs.access(HISTORY_FILE);
    } catch {
      // File doesn't exist, return empty history
      return NextResponse.json({ messages: [], markdown: "" });
    }

    // Read the file
    const content = await fs.readFile(HISTORY_FILE, "utf-8");

    if (!content.trim()) {
      return NextResponse.json({ messages: [], markdown: "" });
    }

    // Parse markdown to extract messages
    const messages: Message[] = [];
    const lines = content.split("\n");
    let currentMessage: Partial<Message> | null = null;
    let messageContent: string[] = [];

    for (const line of lines) {
      // Check for message header (### User (timestamp) or ### Assistant (timestamp))
      const headerMatch = line.match(/^### (User|Assistant) \((.+)\)$/);

      if (headerMatch) {
        // Save previous message if exists
        if (currentMessage && messageContent.length > 0) {
          currentMessage.content = messageContent.join("\n").trim();
          messages.push(currentMessage as Message);
        }

        // Start new message
        currentMessage = {
          role: headerMatch[1].toLowerCase() as "user" | "assistant",
          timestamp: headerMatch[2],
          content: "",
        };
        messageContent = [];
      } else if (currentMessage && line.trim()) {
        // Add content to current message
        messageContent.push(line);
      }
    }

    // Save last message
    if (currentMessage && messageContent.length > 0) {
      currentMessage.content = messageContent.join("\n").trim();
      messages.push(currentMessage as Message);
    }

    // Prune to last MAX_MESSAGES
    const prunedMessages = messages.slice(-MAX_MESSAGES);

    // Convert back to markdown
    const prunedMarkdown = prunedMessages
      .map((msg) => `### ${msg.role === "user" ? "User" : "Assistant"} (${msg.timestamp})\n${msg.content}\n`)
      .join("\n");

    return NextResponse.json({
      messages: prunedMessages,
      markdown: prunedMarkdown,
      count: prunedMessages.length,
    });
  } catch (error) {
    console.error("Error loading conversation:", error);
    return NextResponse.json({ error: "Failed to load conversation" }, { status: 500 });
  }
}
