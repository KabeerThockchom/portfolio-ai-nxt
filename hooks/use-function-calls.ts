import { useState } from "react";
import { FunctionCall } from "@/types";

// Hook for managing function call tracking
export function useFunctionCalls() {
  const [functionCallHistory, setFunctionCallHistory] = useState<FunctionCall[]>([]);

  return {
    // State
    functionCallHistory,

    // Setters
    setFunctionCallHistory,
  };
}
