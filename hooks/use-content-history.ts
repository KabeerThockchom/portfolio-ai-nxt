import { useState } from "react";
import { HistoryItem, SlideDirection } from "@/types";

// Hook for managing content history and navigation
export function useContentHistory() {
  const [contentHistory, setContentHistory] = useState<HistoryItem[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>('none');

  const canNavigatePrevious = currentHistoryIndex > 0;
  const canNavigateNext = currentHistoryIndex < contentHistory.length - 1;

  return {
    // State
    contentHistory,
    currentHistoryIndex,
    slideDirection,

    // Setters
    setContentHistory,
    setCurrentHistoryIndex,
    setSlideDirection,

    // Helpers
    canNavigatePrevious,
    canNavigateNext,
  };
}
