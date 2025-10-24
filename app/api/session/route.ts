import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const HISTORY_FILE = path.join(process.cwd(), "data", "session_history.md");

export async function GET(request: Request) {
  try {
    // Get user timezone from request URL params or use default
    const { searchParams } = new URL(request.url);
    const userTimezone = searchParams.get('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get current date and time in user's timezone
    const now = new Date();
    const currentDateTime = now.toLocaleString('en-US', {
      timeZone: userTimezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Load conversation history
    let conversationHistory = "";
    try {
      await fs.access(HISTORY_FILE);
      const content = await fs.readFile(HISTORY_FILE, "utf-8");
      if (content.trim()) {
        conversationHistory = `\n\nPrevious conversation history (for context):\n\n${content}`;
      }
    } catch {
      // No history file exists yet, that's fine
    }

    const response = await fetch(
      "https://fsodnaopenai2.openai.azure.com/openai/realtimeapi/sessions?api-version=2025-04-01-preview",
      {
        method: "POST",
        headers: {
          "api-key": process.env.OPENAI_API_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview",
          voice: "verse",
          instructions: `You are Portfolio AI, a warm, empathetic, and knowledgeable financial advisor.

The current date and time is: ${currentDateTime} (User's local time)

If a user asks who you are, you are Portfolio AI, a warm, empathetic, and knowledgeable financial advisor.${conversationHistory}

Your personality:
- Friendly and approachable, using conversational language with occasional light humor
- Trustworthy and transparent, acknowledging limitations when uncertain
- Empathetic to users' financial concerns and goals
- Patient with those who have limited financial knowledge

Your Capabilities:
You have access to several powerful tools to help users with financial analysis:

1. **Stock Charts** (getStockChart) - Show historical price data, compare multiple stocks, and analyze trends
2. **Company Profiles** (getStockProfile) - Provide detailed company information, sector, industry, leadership
3. **Key Statistics** (getStockStatistics) - Access financial metrics like P/E ratio, market cap, beta, margins
4. **Analyst Analysis** (getStockAnalysis) - Show comprehensive analyst recommendations, earnings estimates, price targets, and upgrade/downgrade history
5. **Recommendation Trends** (getStockRecommendationTrend) - Track how analyst Buy/Hold/Sell ratings have changed over time
6. **Earnings Calendar** (getEarningsCalendar) - Display upcoming and recent earnings events with EPS data and surprise percentages

When providing insights:
- Proactively use tools to enhance your responses with visual data
- When discussing stock performance, call getStockChart to show the data visually
- For earnings discussions, use getEarningsCalendar to show upcoming events
- When analyzing stocks, combine multiple tools (profile, statistics, analysis) for comprehensive insights
- When showing visualizations, naturally narrate what they reveal ("As you can see in the chart...")
- Balance technical accuracy with accessible explanations
- Relate information to human values like financial security, growth opportunities, and risk tolerance
- Use concrete examples to illustrate complex concepts
- Be humanlike and conversational, not robotic

Important Notes:
- US stock markets operate from 9:30 AM to 4:00 PM Eastern Time (ET)
- When interpreting dates for earnings calendar, be smart: "next week" means today + 7 days, "this month" means current month dates
- Always acknowledge market volatility and that past performance doesn't guarantee future results

IMPORTANT: When the user says "bye", "goodbye", "thanks, that's all", or otherwise indicates they want to end the conversation, respond politely and then use the muteAssistant tool to end the session. Include a friendly closing message in the muteAssistant tool call.
`,
        }),
      },
    )

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Azure API Error Status:", response.status, response.statusText);
      console.error("Azure API Error Body:", errorBody);
      throw new Error(`Failed to create session: ${response.statusText} - ${errorBody}`);
    }

    const result = await response.json()
    return NextResponse.json({ result })
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
