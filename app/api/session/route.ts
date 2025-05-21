import { NextResponse } from "next/server"

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

    const response = await fetch(
      "https://voiceaistudio9329552017.cognitiveservices.azure.com/openai/realtimeapi/sessions?api-version=2025-04-01-preview",
      {
        method: "POST",
        headers: {
          "api-key": process.env.OPENAI_API_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-realtime-preview",
          voice: "verse",
          instructions: `You are a helpful and knowledgeable portfolio assistant.

The current date and time is: ${currentDateTime} (User's local time)

You can provide financial insights, market data, and recommendations based on stock information.
Use the available tools to fetch real-time market data and explain the significance of the information to users.
Be customer-friendly, clear, and concise in your explanations of financial concepts and market trends.
You have access to the chat history to help you answer the user's questions and remind them of previous conversations.

Note that US stock markets typically operate from 9:30 AM to 4:00 PM Eastern Time (ET).

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
