import { useState, useRef } from "react";

// Hook for managing UI state (sidebar, dialogs, loading, etc.)
export function useUiState() {
  const [isLoading, setIsLoading] = useState(false);
  const [showComponents, setShowComponents] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [showHelpGlow, setShowHelpGlow] = useState(false);

  // Touch handling refs for swipe gestures
  const touchStartXRef = useRef<number | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  return {
    // State
    isLoading,
    showComponents,
    isSidebarCollapsed,
    isHelpDialogOpen,
    showHelpGlow,

    // Setters
    setIsLoading,
    setShowComponents,
    setIsSidebarCollapsed,
    setIsHelpDialogOpen,
    setShowHelpGlow,

    // Refs
    touchStartXRef,
    mainContentRef,
  };
}
