import { useState, useRef, useCallback } from "react";
import { ConversationMessage } from "@/types";

// Hook for managing conversation state
export function useConversation() {
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [currentLlmMessage, setCurrentLlmMessage] = useState<string>("");
  const lastMessageRef = useRef<string>("");
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Save conversation message to history file
  const saveConversationMessage = useCallback(async (role: "user" | "assistant", message: string) => {
    try {
      await fetch("/api/conversation/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, message }),
      });
    } catch (error) {
      console.error("Failed to save conversation message:", error);
    }
  }, []);

  // Clear conversation history (start fresh session)
  const clearConversationHistory = useCallback(async () => {
    try {
      await fetch("/api/conversation/clear", {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to clear conversation history:", error);
    }
  }, []);

  return {
    // State
    conversationMessages,
    currentLlmMessage,

    // Setters
    setConversationMessages,
    setCurrentLlmMessage,

    // Refs
    lastMessageRef,
    transcriptEndRef,

    // Functions
    saveConversationMessage,
    clearConversationHistory,
  };
}
