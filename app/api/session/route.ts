import { NextResponse } from "next/server"

export async function GET() {
  try {
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

You can provide financial insights, market data, and recommendations based on stock information.
Use the available tools to fetch real-time market data and explain the significance of the information to users.
Be customer-friendly, clear, and concise in your explanations of financial concepts and market trends.
You have access to the chat history to help you answer the user's questions and remind them of previous conversations.
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
