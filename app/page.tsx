"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, BarChart4, Info, ChevronLeft, ChevronRight, Sparkles, HelpCircle, TrendingUp, Users } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import StockInfoPanel from "@/components/stock-info-panel"
import StockProfileCard from "@/components/stock-profile-card"
import StockStatisticsCard from "@/components/stock-statistics-card"
import StockAnalysisCard from "@/components/stock-analysis-card"
import StockRecommendationTrendCard from "@/components/stock-recommendation-trend-card"
import StockEarningsCalendarCard from "@/components/stock-earnings-calendar-card"
import TrendingTickersCard from "@/components/trending-tickers-card"
import StockInsiderTransactionsCard from "@/components/stock-insider-transactions-card"
import StockBalanceSheetCard from "@/components/stock-balance-sheet-card"
import StockIncomeStatementCard from "@/components/stock-income-statement-card"
import StockCashFlowCard from "@/components/stock-cash-flow-card"
import { ApiCallDetails } from "@/components/api-call-details"
import { useToast } from "@/hooks/use-toast"
import StockChart from "@/components/stock-chart"
import { ThemeToggle } from "@/components/theme-toggle"
import TypewriterBadges from "@/components/ui/typewriter-badges"
import AudioSphereVisualizer from "@/components/ui/audio-sphere-visualizer"
import ReactMarkdown from "react-markdown"
import { ApiCallMetadata } from "@/types"

// Define types for chartData
interface ChartMeta {
  dataGranularity?: string;
  range?: string;
  // Add other meta properties if known
}

interface ChartResultItem {
  meta: ChartMeta;
  timestamp?: number[];
  indicators?: {
    quote?: Array<{
      close?: Array<number | null>;
      open?: Array<number | null>;
      high?: Array<number | null>;
      low?: Array<number | null>;
      volume?: Array<number | null>;
    }>;
    adjclose?: Array<{
      adjclose?: Array<number | null>;
    }>;
  };
  // Add other result item properties if known
}

interface ChartData {
  chart?: {
    result?: ChartResultItem[];
    error?: any; // Or a more specific error type
  };
  success?: boolean;
  error?: string;
  // Add other chartData properties if known, e.g., from fetchStockChart response
}

// Type for the full API response from /api/stock/chart, which might contain chartData
interface ApiStockChartResponse {
  chartData?: ChartData; // The actual chart data is nested here
  success?: boolean;
  error?: string;
}

// Define the type for the dynamically imported module
type RtcHelpersModule = typeof import('@/lib/webrtc-helpers');

// Interface for history items - supports chart, profile, and statistics
interface HistoryItem {
  type: "chart" | "profile" | "statistics" | "analysis" | "recommendation-trend" | "earnings-calendar" | "trending-tickers" | "insider-transactions" | "balance-sheet" | "income-statement" | "cash-flow";
  symbol: string;
  // API call metadata
  apiCallDetails?: ApiCallMetadata;
  // Chart-specific data
  chartData?: ChartData;
  mainStock?: string;
  selectedStock?: string;
  comparisonStocks?: string[];
  viewMode?: "price" | "percent" | "relative";
  // Profile-specific data
  profileData?: any;
  // Statistics-specific data
  statisticsData?: any;
  // Analysis-specific data
  analysisData?: any;
  // Recommendation Trend-specific data
  recommendationTrendData?: any;
  // Earnings Calendar-specific data
  earningsCalendarData?: any;
  earningsCalendarDateRange?: { period1?: string; period2?: string };
  // Trending Tickers-specific data
  trendingTickersData?: any;
  trendingTickersRegion?: string;
  // Insider Transactions-specific data
  insiderTransactionsData?: any;
  // Financial Statements-specific data
  balanceSheetData?: any;
  incomeStatementData?: any;
  cashFlowData?: any;
}

const examplePrompts = [
  "How did Apple do the last 3 months?",
  "Compare Tesla to Ford and GM",
  "Tell me about NVIDIA's company profile",
  "What are the key stats for Microsoft?",
  "Show me analyst recommendations for Tesla",
  "What's the recommendation trend for Amazon?",
  "What are the trending stocks today?",
  "Show me upcoming earnings this week",
  "Show me insider transactions for Apple",
  "Show me Apple's balance sheet",
  "What's Tesla's income statement?",
  "Show me Microsoft's cash flow statement",
];

// Custom AutoAwesome icon component that mimics Material UI's AutoAwesome
const AutoAwesomeIcon = ({ className = "" }: { className?: string }) => {
  return (
    <span className={`${className} animate-pulse-glow`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffe600" width="24" height="24">
        <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
      </svg>
    </span>
  );
};

export default function Home() {
  const [isListening, setIsListening] = useState(false)
  const [rapidApiKey, setRapidApiKey] = useState("")
  const [selectedStock, setSelectedStock] = useState("")
  const [comparisonStocks, setComparisonStocks] = useState<string[]>([])
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [profileData, setProfileData] = useState<any | null>(null)
  const [statisticsData, setStatisticsData] = useState<any | null>(null)
  const [analysisData, setAnalysisData] = useState<any | null>(null)
  const [recommendationTrendData, setRecommendationTrendData] = useState<any | null>(null)
  const [earningsCalendarData, setEarningsCalendarData] = useState<any | null>(null)
  const [profileSymbol, setProfileSymbol] = useState<string>("")
  const [statisticsSymbol, setStatisticsSymbol] = useState<string>("")
  const [analysisSymbol, setAnalysisSymbol] = useState<string>("")
  const [recommendationTrendSymbol, setRecommendationTrendSymbol] = useState<string>("")
  const [earningsCalendarDateRange, setEarningsCalendarDateRange] = useState<{ period1?: string; period2?: string }>({})
  const [trendingTickersData, setTrendingTickersData] = useState<any | null>(null)
  const [trendingTickersRegion, setTrendingTickersRegion] = useState<string>("")
  const [insiderTransactionsData, setInsiderTransactionsData] = useState<any | null>(null)
  const [insiderTransactionsSymbol, setInsiderTransactionsSymbol] = useState<string>("")
  const [balanceSheetData, setBalanceSheetData] = useState<any | null>(null)
  const [balanceSheetSymbol, setBalanceSheetSymbol] = useState<string>("")
  const [incomeStatementDataState, setIncomeStatementDataState] = useState<any | null>(null)
  const [incomeStatementSymbol, setIncomeStatementSymbol] = useState<string>("")
  const [cashFlowDataState, setCashFlowDataState] = useState<any | null>(null)
  const [cashFlowSymbol, setCashFlowSymbol] = useState<string>("")

  // API metadata state
  const [chartApiDetails, setChartApiDetails] = useState<ApiCallMetadata | undefined>(undefined)
  const [profileApiDetails, setProfileApiDetails] = useState<ApiCallMetadata | undefined>(undefined)
  const [statisticsApiDetails, setStatisticsApiDetails] = useState<ApiCallMetadata | undefined>(undefined)
  const [analysisApiDetails, setAnalysisApiDetails] = useState<ApiCallMetadata | undefined>(undefined)
  const [recommendationTrendApiDetails, setRecommendationTrendApiDetails] = useState<ApiCallMetadata | undefined>(undefined)
  const [earningsCalendarApiDetails, setEarningsCalendarApiDetails] = useState<ApiCallMetadata | undefined>(undefined)
  const [trendingTickersApiDetails, setTrendingTickersApiDetails] = useState<ApiCallMetadata | undefined>(undefined)
  const [insiderTransactionsApiDetails, setInsiderTransactionsApiDetails] = useState<ApiCallMetadata | undefined>(undefined)
  const [balanceSheetApiDetails, setBalanceSheetApiDetails] = useState<ApiCallMetadata | undefined>(undefined)
  const [incomeStatementApiDetails, setIncomeStatementApiDetails] = useState<ApiCallMetadata | undefined>(undefined)
  const [cashFlowApiDetails, setCashFlowApiDetails] = useState<ApiCallMetadata | undefined>(undefined)

  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [rtcHelpers, setRtcHelpers] = useState<RtcHelpersModule | null>(null);
  const [showComponents, setShowComponents] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [showHelpGlow, setShowHelpGlow] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const [currentChartView, setCurrentChartView] = useState<"price" | "percent" | "relative">("price")
  const [mainStock, setMainStock] = useState("")

  // State for content history carousel (charts, profiles, statistics)
  const [contentHistory, setContentHistory] = useState<HistoryItem[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [llmResponseHistory, setLlmResponseHistory] = useState<string[]>([]);
  const [currentLlmMessage, setCurrentLlmMessage] = useState<string>("");

  // Conversation messages with role (user/assistant)
  const [conversationMessages, setConversationMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [currentUserMessage, setCurrentUserMessage] = useState<string>("");

  // Animation direction state
  const [slideDirection, setSlideDirection] = useState<'none' | 'left' | 'right'>('none');

  // Touch handling for swipe gestures
  const touchStartXRef = useRef<number | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Add a ref to track the last message content for deduplication
  const lastMessageRef = useRef<string>("");

  // Ref for auto-scrolling transcript
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast()

  useEffect(() => {
    fetchApiKeys()
    setMounted(true)

    import('@/lib/webrtc-helpers')
      .then(module => {
        setRtcHelpers(module);
      })
      .catch(err => {
        console.error("Failed to load WebRTC helpers:", err);
        toast({
          title: "Initialization Error",
          description: "Voice assistant features may not be available. Please refresh.",
          variant: "destructive",
        });
      });
  }, [toast])

  // Auto-open help dialog on first visit
  useEffect(() => {
    const hasSeenHelp = localStorage.getItem('portfolio-ai-help-seen');
    if (!hasSeenHelp) {
      // Small delay to let the UI render first
      setTimeout(() => {
        setIsHelpDialogOpen(true);
      }, 1000);
    } else {
      // Show glow effect if they haven't clicked help in this session
      const hasClickedHelpThisSession = sessionStorage.getItem('portfolio-ai-help-clicked');
      if (!hasClickedHelpThisSession) {
        setShowHelpGlow(true);
      }
    }
  }, []);

  // Auto-scroll transcript to bottom when new messages arrive
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [conversationMessages, currentLlmMessage]);

  // Handle help dialog close
  const handleHelpDialogChange = (open: boolean) => {
    setIsHelpDialogOpen(open);
    if (open) {
      // Mark as seen in localStorage (persists across sessions)
      localStorage.setItem('portfolio-ai-help-seen', 'true');
      // Mark as clicked in sessionStorage (for this session only)
      sessionStorage.setItem('portfolio-ai-help-clicked', 'true');
      // Hide the glow effect
      setShowHelpGlow(false);
    }
  };

  const fetchApiKeys = async () => {
    try {
      // Get user's timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Fetch API keys
      const keysResponse = await fetch("/api/keys");
      const keysData = await keysResponse.json();
      setRapidApiKey(keysData.rapidApiKey);

      // Initialize session with user's timezone
      await fetch(`/api/session?timezone=${encodeURIComponent(userTimezone)}`);
    } catch (error) {
      console.error("Failed to load API keys:", error);
      toast({
        title: "Error",
        description: "Failed to load API keys. Some features may not work.",
        variant: "destructive",
      });
    }
  };

  // Save conversation message to history file
  const saveConversationMessage = async (role: "user" | "assistant", message: string) => {
    try {
      await fetch("/api/conversation/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, message }),
      });
    } catch (error) {
      console.error("Failed to save conversation message:", error);
    }
  };

  // Clear conversation history (start fresh session)
  const clearConversationHistory = async () => {
    try {
      await fetch("/api/conversation/clear", {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to clear conversation history:", error);
    }
  };

  const fetchStockChart = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { symbol, region, comparisons, range, interval, events } = args
      const params = new URLSearchParams()
      params.append("symbol", symbol)
      if (region) params.append("region", region)
      if (comparisons) params.append("comparisons", comparisons)
      if (range) params.append("range", range || "1mo")
      if (interval) params.append("interval", interval || "1d")
      if (events) params.append("events", events || "div,split,earn")
      params.append("includeAdjustedClose", "true")

      const response = await fetch(`/api/stock/chart?${params.toString()}`)
      const result: ApiStockChartResponse = await response.json()

      if (!response.ok) { // Check response.ok for network errors
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch stock chart")
      }
      return result
    } catch (error) {
      console.error("Error fetching stock chart:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error fetching stock chart",
      }
    }
  }, []); // Removed toast from deps if not used directly here

  const fetchStockProfile = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { symbol, region } = args
      const params = new URLSearchParams()
      params.append("symbol", symbol)
      if (region) params.append("region", region)
      const response = await fetch(`/api/stock/profile?${params.toString()}`)
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json()
    } catch (error) {
      console.error("Error fetching stock profile:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching stock profile" }
    }
  }, []);

  const fetchStockStatistics = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { symbol, region } = args
      const params = new URLSearchParams()
      params.append("symbol", symbol)
      if (region) params.append("region", region)
      const response = await fetch(`/api/stock/statistics?${params.toString()}`)
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json()
    } catch (error) {
      console.error("Error fetching stock statistics:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching stock statistics" }
    }
  }, []);

  const fetchStockAnalysis = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { symbol, region } = args
      const params = new URLSearchParams()
      params.append("symbol", symbol)
      if (region) params.append("region", region)
      const response = await fetch(`/api/stock/analysis?${params.toString()}`)
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json()
    } catch (error) {
      console.error("Error fetching stock analysis:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching stock analysis" }
    }
  }, []);

  const fetchStockRecommendationTrend = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { symbol, region } = args
      const params = new URLSearchParams()
      params.append("symbol", symbol)
      if (region) params.append("region", region)
      const response = await fetch(`/api/stock/recommendation-trend?${params.toString()}`)
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json()
    } catch (error) {
      console.error("Error fetching recommendation trend:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching recommendation trend" }
    }
  }, []);

  const fetchEarningsCalendar = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { period1, period2, region, size, offset, sortField, sortType } = args
      const params = new URLSearchParams()
      if (period1) params.append("period1", period1)
      if (period2) params.append("period2", period2)
      if (region) params.append("region", region)
      if (size) params.append("size", size.toString())
      if (offset) params.append("offset", offset.toString())
      if (sortField) params.append("sortField", sortField)
      if (sortType) params.append("sortType", sortType)
      const response = await fetch(`/api/stock/earnings-calendar?${params.toString()}`)
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json()
    } catch (error) {
      console.error("Error fetching earnings calendar:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching earnings calendar" }
    }
  }, []);

  const fetchTrendingTickers = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { region, lang } = args
      const params = new URLSearchParams()
      if (region) params.append("region", region)
      if (lang) params.append("lang", lang)
      const response = await fetch(`/api/market/trending-tickers?${params.toString()}`)
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json()
    } catch (error) {
      console.error("Error fetching trending tickers:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching trending tickers" }
    }
  }, []);

  const fetchInsiderTransactions = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { symbol, region, lang } = args
      const params = new URLSearchParams()
      params.append("symbol", symbol)
      if (region) params.append("region", region)
      if (lang) params.append("lang", lang)
      const response = await fetch(`/api/stock/insider-transactions?${params.toString()}`)
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json()
    } catch (error) {
      console.error("Error fetching insider transactions:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching insider transactions" }
    }
  }, []);

  const fetchFinancials = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { symbol, region, lang } = args
      const params = new URLSearchParams()
      params.append("symbol", symbol)
      if (region) params.append("region", region)
      if (lang) params.append("lang", lang)
      const response = await fetch(`/api/stock/financials?${params.toString()}`)
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json()
    } catch (error) {
      console.error("Error fetching financials:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching financials" }
    }
  }, []);

  // Define stopAssistant before it's used in handleFunctionCall
  const stopAssistant = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close()
      dataChannelRef.current = null
    }
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null
    }
    setIsListening(false)
  }, []);

  // DEFINE handleFunctionCall and configureDataChannel BEFORE startAssistant
  const handleFunctionCall = useCallback(async (msg: any, dataChannel: RTCDataChannel) => {
    try {
      const args = JSON.parse(msg.arguments)
      let apiResponse: ApiStockChartResponse | { success: false, error: string } | undefined;

      if (msg.name === "getStockChart") {
        setIsLoading(true)
        setShowComponents(false);
        // Clear other content types
        setProfileData(null);
        setStatisticsData(null);

        const startTime = Date.now();
        apiResponse = await fetchStockChart(args)
        const duration = Date.now() - startTime;

        if (apiResponse.success && apiResponse.chartData) {
          const newChartData = apiResponse.chartData;
          const newMainStock = args.symbol;
          const newSelectedStock = args.symbol;
          const newComparisonStocks = args.comparisons ? args.comparisons.split(",").map((s: string) => s.trim()) : [];

          const apiMetadata: ApiCallMetadata = {
            endpoint: '/api/stock/chart',
            method: 'GET',
            parameters: args,
            timestamp: startTime,
            duration: duration,
            region: args.region
          };
          setChartApiDetails(apiMetadata);

          setChartData(newChartData);
          setMainStock(newMainStock);
          setSelectedStock(newSelectedStock);
          setComparisonStocks(newComparisonStocks);

          // Add to history
          setContentHistory(prevHistory => {
            const newEntry: HistoryItem = {
              type: "chart",
              symbol: newMainStock,
              chartData: newChartData,
              mainStock: newMainStock,
              selectedStock: newSelectedStock,
              comparisonStocks: newComparisonStocks,
              viewMode: currentChartView,
              apiCallDetails: apiMetadata,
            };
            const updatedHistory = [...prevHistory, newEntry];
            setCurrentHistoryIndex(updatedHistory.length - 1);
            return updatedHistory;
          });

          setTimeout(() => requestAnimationFrame(() => setShowComponents(true)), 150);
        } else if (apiResponse && !apiResponse.success) {
          toast({ title: "Error fetching chart", description: apiResponse.error, variant: "destructive" });
          setChartData(null);
        }
        setIsLoading(false)
      } else if (msg.name === "getStockProfile") {
        setIsLoading(true)
        setShowComponents(false);
        // Clear other content types
        setChartData(null);
        setStatisticsData(null);

        const startTime = Date.now();
        apiResponse = await fetchStockProfile(args)
        const duration = Date.now() - startTime;

        if (apiResponse && apiResponse.success && (apiResponse as any).profileData) {
          const newProfileData = (apiResponse as any).profileData;

          const apiMetadata: ApiCallMetadata = {
            endpoint: '/api/stock/profile',
            method: 'GET',
            parameters: args,
            timestamp: startTime,
            duration: duration,
            region: args.region
          };
          setProfileApiDetails(apiMetadata);

          setProfileData(newProfileData)
          setProfileSymbol(args.symbol)

          // Add to history
          setContentHistory(prevHistory => {
            const newEntry: HistoryItem = {
              type: "profile",
              symbol: args.symbol,
              profileData: newProfileData,
              apiCallDetails: apiMetadata,
            };
            const updatedHistory = [...prevHistory, newEntry];
            setCurrentHistoryIndex(updatedHistory.length - 1);
            return updatedHistory;
          });

          setTimeout(() => requestAnimationFrame(() => setShowComponents(true)), 150);
        } else if (apiResponse && !apiResponse.success) {
          toast({ title: "Error fetching profile", description: apiResponse.error, variant: "destructive" });
          setProfileData(null)
        }
        setIsLoading(false)
      } else if (msg.name === "getStockStatistics") {
        setIsLoading(true)
        setShowComponents(false);
        // Clear other content types
        setChartData(null);
        setProfileData(null);

        const startTime = Date.now();
        apiResponse = await fetchStockStatistics(args)
        const duration = Date.now() - startTime;

        if (apiResponse && apiResponse.success && (apiResponse as any).statisticsData) {
          const newStatisticsData = (apiResponse as any).statisticsData;

          const apiMetadata: ApiCallMetadata = {
            endpoint: '/api/stock/statistics',
            method: 'GET',
            parameters: args,
            timestamp: startTime,
            duration: duration,
            region: args.region
          };
          setStatisticsApiDetails(apiMetadata);

          setStatisticsData(newStatisticsData)
          setStatisticsSymbol(args.symbol)

          // Add to history
          setContentHistory(prevHistory => {
            const newEntry: HistoryItem = {
              type: "statistics",
              symbol: args.symbol,
              statisticsData: newStatisticsData,
              apiCallDetails: apiMetadata,
            };
            const updatedHistory = [...prevHistory, newEntry];
            setCurrentHistoryIndex(updatedHistory.length - 1);
            return updatedHistory;
          });

          setTimeout(() => requestAnimationFrame(() => setShowComponents(true)), 150);
        } else if (apiResponse && !apiResponse.success) {
          toast({ title: "Error fetching statistics", description: apiResponse.error, variant: "destructive" });
          setStatisticsData(null)
        }
        setIsLoading(false)
      } else if (msg.name === "getStockAnalysis") {
        setIsLoading(true)
        setShowComponents(false);
        // Clear other content types
        setChartData(null);
        setProfileData(null);
        setStatisticsData(null);

        const startTime = Date.now();
        apiResponse = await fetchStockAnalysis(args)
        const duration = Date.now() - startTime;

        if (apiResponse && apiResponse.success && (apiResponse as any).analysisData) {
          const newAnalysisData = (apiResponse as any).analysisData;

          const apiMetadata: ApiCallMetadata = {
            endpoint: '/api/stock/analysis',
            method: 'GET',
            parameters: args,
            timestamp: startTime,
            duration: duration,
            region: args.region
          };
          setAnalysisApiDetails(apiMetadata);

          setAnalysisData(newAnalysisData)
          setAnalysisSymbol(args.symbol)

          // Add to history
          setContentHistory(prevHistory => {
            const newEntry: HistoryItem = {
              type: "analysis",
              symbol: args.symbol,
              analysisData: newAnalysisData,
              apiCallDetails: apiMetadata,
            };
            const updatedHistory = [...prevHistory, newEntry];
            setCurrentHistoryIndex(updatedHistory.length - 1);
            return updatedHistory;
          });

          setTimeout(() => requestAnimationFrame(() => setShowComponents(true)), 150);
        } else if (apiResponse && !apiResponse.success) {
          toast({ title: "Error fetching analysis", description: apiResponse.error, variant: "destructive" });
          setAnalysisData(null)
        }
        setIsLoading(false)
      } else if (msg.name === "getStockRecommendationTrend") {
        setIsLoading(true)
        setShowComponents(false);
        // Clear other content types
        setChartData(null);
        setProfileData(null);
        setStatisticsData(null);
        setAnalysisData(null);

        const startTime = Date.now();
        apiResponse = await fetchStockRecommendationTrend(args)
        const duration = Date.now() - startTime;

        if (apiResponse && apiResponse.success && (apiResponse as any).recommendationTrendData) {
          const newRecommendationTrendData = (apiResponse as any).recommendationTrendData;

          const apiMetadata: ApiCallMetadata = {
            endpoint: '/api/stock/recommendation-trend',
            method: 'GET',
            parameters: args,
            timestamp: startTime,
            duration: duration,
            region: args.region
          };
          setRecommendationTrendApiDetails(apiMetadata);

          setRecommendationTrendData(newRecommendationTrendData)
          setRecommendationTrendSymbol(args.symbol)

          // Add to history
          setContentHistory(prevHistory => {
            const newEntry: HistoryItem = {
              type: "recommendation-trend",
              symbol: args.symbol,
              recommendationTrendData: newRecommendationTrendData,
              apiCallDetails: apiMetadata,
            };
            const updatedHistory = [...prevHistory, newEntry];
            setCurrentHistoryIndex(updatedHistory.length - 1);
            return updatedHistory;
          });

          setTimeout(() => requestAnimationFrame(() => setShowComponents(true)), 150);
        } else if (apiResponse && !apiResponse.success) {
          toast({ title: "Error fetching recommendation trend", description: apiResponse.error, variant: "destructive" });
          setRecommendationTrendData(null)
        }
        setIsLoading(false)
      } else if (msg.name === "getEarningsCalendar") {
        setIsLoading(true)
        setShowComponents(false);
        // Clear other content types
        setChartData(null);
        setProfileData(null);
        setStatisticsData(null);
        setAnalysisData(null);
        setRecommendationTrendData(null);

        const startTime = Date.now();
        apiResponse = await fetchEarningsCalendar(args)
        const duration = Date.now() - startTime;

        if (apiResponse && apiResponse.success && (apiResponse as any).earningsCalendarData) {
          const newEarningsCalendarData = (apiResponse as any).earningsCalendarData;

          const apiMetadata: ApiCallMetadata = {
            endpoint: '/api/stock/earnings-calendar',
            method: 'GET',
            parameters: args,
            timestamp: startTime,
            duration: duration,
            region: args.region
          };
          setEarningsCalendarApiDetails(apiMetadata);

          setEarningsCalendarData(newEarningsCalendarData)
          setEarningsCalendarDateRange({ period1: args.period1, period2: args.period2 })

          // Add to history
          setContentHistory(prevHistory => {
            const newEntry: HistoryItem = {
              type: "earnings-calendar",
              symbol: "", // Calendar doesn't have a single symbol
              earningsCalendarData: newEarningsCalendarData,
              earningsCalendarDateRange: { period1: args.period1, period2: args.period2 },
              apiCallDetails: apiMetadata,
            };
            const updatedHistory = [...prevHistory, newEntry];
            setCurrentHistoryIndex(updatedHistory.length - 1);
            return updatedHistory;
          });

          setTimeout(() => requestAnimationFrame(() => setShowComponents(true)), 150);
        } else if (apiResponse && !apiResponse.success) {
          toast({ title: "Error fetching earnings calendar", description: apiResponse.error, variant: "destructive" });
          setEarningsCalendarData(null)
        }
        setIsLoading(false)
      } else if (msg.name === "getTrendingTickers") {
        setIsLoading(true)
        setShowComponents(false);
        // Clear other content types
        setChartData(null);
        setProfileData(null);
        setStatisticsData(null);
        setAnalysisData(null);
        setRecommendationTrendData(null);
        setEarningsCalendarData(null);

        const startTime = Date.now();
        apiResponse = await fetchTrendingTickers(args)
        const duration = Date.now() - startTime;

        if (apiResponse && apiResponse.success && (apiResponse as any).trendingTickersData) {
          const newTrendingTickersData = (apiResponse as any).trendingTickersData;

          const apiMetadata: ApiCallMetadata = {
            endpoint: '/api/market/trending-tickers',
            method: 'GET',
            parameters: args,
            timestamp: startTime,
            duration: duration,
            region: args.region || "US"
          };
          setTrendingTickersApiDetails(apiMetadata);

          setTrendingTickersData(newTrendingTickersData)
          setTrendingTickersRegion(args.region || "US")

          // Add to history
          setContentHistory(prevHistory => {
            const newEntry: HistoryItem = {
              type: "trending-tickers",
              symbol: "", // Trending tickers doesn't have a single symbol
              trendingTickersData: newTrendingTickersData,
              trendingTickersRegion: args.region || "US",
              apiCallDetails: apiMetadata,
            };
            const updatedHistory = [...prevHistory, newEntry];
            setCurrentHistoryIndex(updatedHistory.length - 1);
            return updatedHistory;
          });

          setTimeout(() => requestAnimationFrame(() => setShowComponents(true)), 150);
        } else if (apiResponse && !apiResponse.success) {
          toast({ title: "Error fetching trending tickers", description: apiResponse.error, variant: "destructive" });
          setTrendingTickersData(null)
        }
        setIsLoading(false)
      } else if (msg.name === "getInsiderTransactions") {
        setIsLoading(true)
        setShowComponents(false);
        // Clear other content types
        setChartData(null);
        setProfileData(null);
        setStatisticsData(null);
        setAnalysisData(null);
        setRecommendationTrendData(null);
        setEarningsCalendarData(null);
        setTrendingTickersData(null);

        const startTime = Date.now();
        apiResponse = await fetchInsiderTransactions(args)
        const duration = Date.now() - startTime;

        if (apiResponse && apiResponse.success && (apiResponse as any).insiderTransactionsData) {
          const newInsiderTransactionsData = (apiResponse as any).insiderTransactionsData;

          const apiMetadata: ApiCallMetadata = {
            endpoint: '/api/stock/insider-transactions',
            method: 'GET',
            parameters: args,
            timestamp: startTime,
            duration: duration,
            region: args.region
          };
          setInsiderTransactionsApiDetails(apiMetadata);

          setInsiderTransactionsData(newInsiderTransactionsData)
          setInsiderTransactionsSymbol(args.symbol)

          // Add to history
          setContentHistory(prevHistory => {
            const newEntry: HistoryItem = {
              type: "insider-transactions",
              symbol: args.symbol,
              insiderTransactionsData: newInsiderTransactionsData,
              apiCallDetails: apiMetadata,
            };
            const updatedHistory = [...prevHistory, newEntry];
            setCurrentHistoryIndex(updatedHistory.length - 1);
            return updatedHistory;
          });

          setTimeout(() => requestAnimationFrame(() => setShowComponents(true)), 150);
        } else if (apiResponse && !apiResponse.success) {
          toast({ title: "Error fetching insider transactions", description: apiResponse.error, variant: "destructive" });
          setInsiderTransactionsData(null)
        }
        setIsLoading(false)
      } else if (msg.name === "getBalanceSheet") {
        setIsLoading(true)
        setShowComponents(false);
        // Clear other content types
        setChartData(null);
        setProfileData(null);
        setStatisticsData(null);
        setAnalysisData(null);
        setRecommendationTrendData(null);
        setEarningsCalendarData(null);
        setTrendingTickersData(null);
        setInsiderTransactionsData(null);
        setIncomeStatementDataState(null);
        setCashFlowDataState(null);

        const startTime = Date.now();
        apiResponse = await fetchFinancials(args)
        const duration = Date.now() - startTime;

        if (apiResponse && apiResponse.success && (apiResponse as any).financialsData) {
          const newFinancialsData = (apiResponse as any).financialsData;

          const apiMetadata: ApiCallMetadata = {
            endpoint: '/api/stock/financials',
            method: 'GET',
            parameters: args,
            timestamp: startTime,
            duration: duration,
            region: args.region
          };
          setBalanceSheetApiDetails(apiMetadata);

          setBalanceSheetData(newFinancialsData)
          setBalanceSheetSymbol(args.symbol)

          // Add to history
          setContentHistory(prevHistory => {
            const newEntry: HistoryItem = {
              type: "balance-sheet",
              symbol: args.symbol,
              balanceSheetData: newFinancialsData,
              apiCallDetails: apiMetadata,
            };
            const updatedHistory = [...prevHistory, newEntry];
            setCurrentHistoryIndex(updatedHistory.length - 1);
            return updatedHistory;
          });

          setTimeout(() => requestAnimationFrame(() => setShowComponents(true)), 150);
        } else if (apiResponse && !apiResponse.success) {
          toast({ title: "Error fetching balance sheet", description: apiResponse.error, variant: "destructive" });
          setBalanceSheetData(null)
        }
        setIsLoading(false)
      } else if (msg.name === "getIncomeStatement") {
        setIsLoading(true)
        setShowComponents(false);
        // Clear other content types
        setChartData(null);
        setProfileData(null);
        setStatisticsData(null);
        setAnalysisData(null);
        setRecommendationTrendData(null);
        setEarningsCalendarData(null);
        setTrendingTickersData(null);
        setInsiderTransactionsData(null);
        setBalanceSheetData(null);
        setCashFlowDataState(null);

        const startTime = Date.now();
        apiResponse = await fetchFinancials(args)
        const duration = Date.now() - startTime;

        if (apiResponse && apiResponse.success && (apiResponse as any).financialsData) {
          const newFinancialsData = (apiResponse as any).financialsData;

          const apiMetadata: ApiCallMetadata = {
            endpoint: '/api/stock/financials',
            method: 'GET',
            parameters: args,
            timestamp: startTime,
            duration: duration,
            region: args.region
          };
          setIncomeStatementApiDetails(apiMetadata);

          setIncomeStatementDataState(newFinancialsData)
          setIncomeStatementSymbol(args.symbol)

          // Add to history
          setContentHistory(prevHistory => {
            const newEntry: HistoryItem = {
              type: "income-statement",
              symbol: args.symbol,
              incomeStatementData: newFinancialsData,
              apiCallDetails: apiMetadata,
            };
            const updatedHistory = [...prevHistory, newEntry];
            setCurrentHistoryIndex(updatedHistory.length - 1);
            return updatedHistory;
          });

          setTimeout(() => requestAnimationFrame(() => setShowComponents(true)), 150);
        } else if (apiResponse && !apiResponse.success) {
          toast({ title: "Error fetching income statement", description: apiResponse.error, variant: "destructive" });
          setIncomeStatementDataState(null)
        }
        setIsLoading(false)
      } else if (msg.name === "getCashFlow") {
        setIsLoading(true)
        setShowComponents(false);
        // Clear other content types
        setChartData(null);
        setProfileData(null);
        setStatisticsData(null);
        setAnalysisData(null);
        setRecommendationTrendData(null);
        setEarningsCalendarData(null);
        setTrendingTickersData(null);
        setInsiderTransactionsData(null);
        setBalanceSheetData(null);
        setIncomeStatementDataState(null);

        const startTime = Date.now();
        apiResponse = await fetchFinancials(args)
        const duration = Date.now() - startTime;

        if (apiResponse && apiResponse.success && (apiResponse as any).financialsData) {
          const newFinancialsData = (apiResponse as any).financialsData;

          const apiMetadata: ApiCallMetadata = {
            endpoint: '/api/stock/financials',
            method: 'GET',
            parameters: args,
            timestamp: startTime,
            duration: duration,
            region: args.region
          };
          setCashFlowApiDetails(apiMetadata);

          setCashFlowDataState(newFinancialsData)
          setCashFlowSymbol(args.symbol)

          // Add to history
          setContentHistory(prevHistory => {
            const newEntry: HistoryItem = {
              type: "cash-flow",
              symbol: args.symbol,
              cashFlowData: newFinancialsData,
              apiCallDetails: apiMetadata,
            };
            const updatedHistory = [...prevHistory, newEntry];
            setCurrentHistoryIndex(updatedHistory.length - 1);
            return updatedHistory;
          });

          setTimeout(() => requestAnimationFrame(() => setShowComponents(true)), 150);
        } else if (apiResponse && !apiResponse.success) {
          toast({ title: "Error fetching cash flow statement", description: apiResponse.error, variant: "destructive" });
          setCashFlowDataState(null)
        }
        setIsLoading(false)
      } else if (msg.name === "muteAssistant") {
        // Allow the assistant to end the conversation
        stopAssistant();
        toast({
          title: "Assistant Disconnected",
          description: args.message || "The assistant has ended the conversation.",
        });
        apiResponse = { success: true };
      } else {
        apiResponse = { success: false, error: "Function not implemented" }
      }

      const event = {
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: msg.call_id,
          output: JSON.stringify(apiResponse),
        },
      }
      if (dataChannel.readyState === 'open') {
        dataChannel.send(JSON.stringify(event))
        dataChannel.send(JSON.stringify({ type: "response.create" }))
      }
    } catch (error) {
      console.error("Error handling function call:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error in function call";

      const event = {
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: msg.call_id,
          output: JSON.stringify({ success: false, error: errorMessage }),
        },
      }
      if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') { // Use ref here
         dataChannelRef.current.send(JSON.stringify(event))
         dataChannelRef.current.send(JSON.stringify({ type: "response.create" }))
      }
    }
  }, [toast, fetchStockChart, fetchStockProfile, fetchStockStatistics, fetchStockAnalysis, fetchStockRecommendationTrend, fetchEarningsCalendar, fetchTrendingTickers, fetchInsiderTransactions, fetchFinancials, stopAssistant]);

  const configureDataChannel = useCallback((dataChannel: RTCDataChannel) => {
    const event = {
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        tools: [
          // Tools configuration as before
          {
            type: "function",
            name: "getStockChart",
            description: "Fetches chart data for a given stock symbol",
            parameters: {
              type: "object",
              properties: {
                symbol: { type: "string", description: "Stock symbol (e.g., GOOG, AAPL)" },
                region: { type: "string", description: "Region code (e.g., US)" },
                comparisons: { type: "string", description: "Comma-separated list of symbols for comparison" },
                range: {
                  type: "string",
                  description: "Time range (e.g., 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd)",
                },
                interval: {
                  type: "string",
                  description: "Time interval (e.g., 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)",
                },
                events: {
                  type: "string",
                  description: "Comma-separated list of events: capitalGain, div, split, earn, history",
                },
              },
              required: ["symbol"],
            },
          },
          {
            type: "function",
            name: "getStockProfile",
            description: "Fetches company profile information for a given stock symbol",
            parameters: {
              type: "object",
              properties: {
                symbol: { type: "string", description: "Stock symbol (e.g., GOOG, AAPL)" },
                region: { type: "string", description: "Region code (e.g., US)" },
              },
              required: ["symbol"],
            },
          },
          {
            type: "function",
            name: "getStockStatistics",
            description: "Fetches key statistics for a given stock symbol",
            parameters: {
              type: "object",
              properties: {
                symbol: { type: "string", description: "Stock symbol (e.g., GOOG, AAPL)" },
                region: { type: "string", description: "Region code (e.g., US)" },
              },
              required: ["symbol"],
            },
          },
          {
            type: "function",
            name: "getStockAnalysis",
            description: "Fetches comprehensive analyst analysis including recommendations, earnings estimates, price targets, and upgrade/downgrade history for a stock",
            parameters: {
              type: "object",
              properties: {
                symbol: { type: "string", description: "Stock symbol (e.g., GOOG, AAPL)" },
                region: { type: "string", description: "Region code (e.g., US)" },
              },
              required: ["symbol"],
            },
          },
          {
            type: "function",
            name: "getStockRecommendationTrend",
            description: "Fetches historical analyst recommendation trends showing how Buy/Hold/Sell ratings have changed over time (current, 1 month ago, 2 months ago, 3 months ago)",
            parameters: {
              type: "object",
              properties: {
                symbol: { type: "string", description: "Stock symbol (e.g., GOOG, AAPL)" },
                region: { type: "string", description: "Region code (e.g., US)" },
              },
              required: ["symbol"],
            },
          },
          {
            type: "function",
            name: "getEarningsCalendar",
            description: "Fetches earnings calendar showing upcoming and recent earnings events. Intelligently interprets user requests like 'next week', 'this month', 'upcoming earnings' and converts them to specific date ranges. Shows company names, tickers, earnings dates/times, EPS estimates, actual EPS, and surprise percentages.",
            parameters: {
              type: "object",
              properties: {
                period1: { type: "string", description: "Start date in YYYY-MM-DD format (e.g., 2024-10-01). Interpret user intent: 'next week' = today to +7 days, 'this month' = first day to last day of current month, 'upcoming' = today to +14 days" },
                period2: { type: "string", description: "End date in YYYY-MM-DD format (e.g., 2024-10-31). Should be after period1." },
                region: { type: "string", description: "Region code (default: US). Options: US, GB, AU, etc." },
                size: { type: "number", description: "Number of events to return (default: 100, max: 250)" },
                offset: { type: "number", description: "Pagination offset (default: 0)" },
                sortField: { type: "string", description: "Field to sort by (default: startdatetime). Options: startdatetime, companyshortname" },
                sortType: { type: "string", description: "Sort order (default: ASC). Options: ASC, DESC" },
              },
              required: [],
            },
          },
          {
            type: "function",
            name: "getTrendingTickers",
            description: "Fetches currently trending stock tickers in the market. Shows stocks with high trading activity, significant price movements, and high investor interest. Displays price, change percentage, market state, and trending score for each ticker. Great for discovering what's hot in the market right now.",
            parameters: {
              type: "object",
              properties: {
                region: { type: "string", description: "Region code (default: US). Options: US, GB, AU, IN, etc." },
                lang: { type: "string", description: "Language code (default: en-US)" },
              },
              required: [],
            },
          },
          {
            type: "function",
            name: "getInsiderTransactions",
            description: "Fetches insider transaction data for a given stock symbol, showing purchases, sales, and grants by company executives, directors, and major shareholders. Includes transaction dates, insider names/roles, number of shares, transaction values, and net buying/selling activity over the past 6 months. Use this to understand insider sentiment and confidence in the company.",
            parameters: {
              type: "object",
              properties: {
                symbol: { type: "string", description: "Stock symbol (e.g., AAPL, TSLA, MSFT)" },
                region: { type: "string", description: "Region code (default: US)" },
                lang: { type: "string", description: "Language code (default: en-US)" },
              },
              required: ["symbol"],
            },
          },
          {
            type: "function",
            name: "getBalanceSheet",
            description: "Fetches balance sheet data for a given stock symbol, showing assets, liabilities, and shareholders' equity over time. Displays both annual and quarterly data with trends. Use this to understand a company's financial position and health.",
            parameters: {
              type: "object",
              properties: {
                symbol: { type: "string", description: "Stock symbol (e.g., AAPL, TSLA, MSFT)" },
                region: { type: "string", description: "Region code (default: US)" },
                lang: { type: "string", description: "Language code (default: en-US)" },
              },
              required: ["symbol"],
            },
          },
          {
            type: "function",
            name: "getIncomeStatement",
            description: "Fetches income statement data for a given stock symbol, showing revenue, expenses, and profitability over time. Displays both annual and quarterly data with trends for net income and profit margins. Use this to understand a company's profitability and operational performance.",
            parameters: {
              type: "object",
              properties: {
                symbol: { type: "string", description: "Stock symbol (e.g., AAPL, TSLA, MSFT)" },
                region: { type: "string", description: "Region code (default: US)" },
                lang: { type: "string", description: "Language code (default: en-US)" },
              },
              required: ["symbol"],
            },
          },
          {
            type: "function",
            name: "getCashFlow",
            description: "Fetches cash flow statement data for a given stock symbol, showing operating, investing, and financing cash flows over time. Displays both annual and quarterly data with trends. Use this to understand how a company generates and uses cash.",
            parameters: {
              type: "object",
              properties: {
                symbol: { type: "string", description: "Stock symbol (e.g., AAPL, TSLA, MSFT)" },
                region: { type: "string", description: "Region code (default: US)" },
                lang: { type: "string", description: "Language code (default: en-US)" },
              },
              required: ["symbol"],
            },
          },
          {
            type: "function",
            name: "muteAssistant",
            description: "Allows the assistant to end the current conversation",
            parameters: {
              type: "object",
              properties: {
                message: { type: "string", description: "Optional message explaining why the conversation is ending" },
              },
              required: [],
            },
          },
        ],
        input_audio_transcription: {
          model: "whisper-1"
        },
      },
    }
    if (dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify(event))
    }
  }, []);

  const startAssistant = useCallback(async () => {
    if (!rtcHelpers) {
      toast({
        title: "Assistant Not Ready",
        description: "WebRTC helpers are not loaded yet. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    // Clear previous session history when starting a new session
    await clearConversationHistory();
    setConversationMessages([]); // Clear conversation messages
    setCurrentLlmMessage(""); // Clear current message

    setIsListening(true);
    try {
      const peerConnection = rtcHelpers.createPeerConnection();
      peerConnectionRef.current = peerConnection;

      peerConnection.ontrack = (event) => {
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = event.streams[0];
        }
      };

      const dataChannel = peerConnection.createDataChannel("oai-events");
      dataChannelRef.current = dataChannel;

      dataChannel.addEventListener("open", () => {
        console.log("Data channel opened");
        configureDataChannel(dataChannel); // Now defined above
      });

      dataChannel.addEventListener("message", async (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.type === "response.function_call_arguments.done") {
          handleFunctionCall(msg, dataChannel);
        } else if (msg.type === "conversation.item.input_audio_transcription.completed") {
          // User speech transcription completed
          const userText = msg.transcript || "";
          if (userText.trim()) {
            setConversationMessages(prev => [...prev, { role: 'user', content: userText }]);
            saveConversationMessage("user", userText);
          }
        } else if (msg.type === "response.text.delta" || msg.type === "response.audio_transcript.delta") {
          if (msg.delta) {
            // Only update current message - don't add to history yet
            setCurrentLlmMessage(prevText => prevText + msg.delta);
          }
        } else if (msg.type === "response.text.done" || msg.type === "response.audio_transcript.done") {
          // Complete the current message
          setCurrentLlmMessage(current => {
            const finalMessage = current + (msg.delta || "");

            // Store this in our ref for deduplication
            lastMessageRef.current = finalMessage;

            // Only add to history if it's not empty
            if (finalMessage.trim()) {
              // Save to persistent storage
              saveConversationMessage("assistant", finalMessage);

              // Add to conversation messages with deduplication
              setConversationMessages(prev => {
                // Check if this message is already in the conversation to prevent duplicates
                if (prev.length > 0 && prev[prev.length - 1].role === 'assistant' && prev[prev.length - 1].content === finalMessage) {
                  // Message already exists, don't add again
                  return prev;
                }
                return [...prev, { role: 'assistant', content: finalMessage }];
              });
            }

            // Clear the current message since it's now in history
            return "";
          });
        }
      });

      const stream = await rtcHelpers.getUserAudioMedia();
      stream.getTracks().forEach((track) => peerConnection.addTransceiver(track, { direction: "sendrecv" }));

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const tokenResponse = await fetch("/api/session");
      const sessionData = await tokenResponse.json();
      if (!sessionData.result || !sessionData.result.client_secret || !sessionData.result.client_secret.value) {
        throw new Error("Failed to retrieve session token from backend.");
      }
      const EPHEMERAL_KEY = sessionData.result.client_secret.value;

      const baseUrl = "https://eastus2.realtimeapi-preview.ai.azure.com/v1/realtimertc";
      const model = "gpt-4o-mini-realtime-preview";
      const response = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure API request failed: ${response.status} ${errorText}`);
      }

      const answer = await response.text();
      await peerConnection.setRemoteDescription({
        sdp: answer,
        type: "answer",
      });

      toast({
        title: "Assistant Ready",
        description: "Voice assistant is now listening. Ask about stocks!",
      });
    } catch (error) {
      console.error("Error starting assistant:", error);
      setIsListening(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to start the voice assistant. Please try again.";
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
        dataChannelRef.current = null;
      }
    }
  }, [rtcHelpers, toast, configureDataChannel, handleFunctionCall]);

  const handlePromptClick = (prompt: string) => {
    if (!isListening) {
      startAssistant().then(() => {
        setTimeout(() => {
          if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
            const event = {
              type: "conversation.item.create",
              item: { type: "text_input", text: prompt },
            };
            dataChannelRef.current.send(JSON.stringify(event));
            dataChannelRef.current.send(JSON.stringify({ type: "response.create" }));
            // Save user message to history
            saveConversationMessage("user", prompt);
            setConversationMessages(prev => [...prev, { role: 'user', content: prompt }]);
            toast({ title: "Prompt Sent", description: `Sent: "${prompt}"` });
          } else {
            toast({ title: "Assistant Not Ready", description: "Could not send prompt. Please try again.", variant: "destructive"});
          }
        }, 1500);
      });
    } else if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      const event = {
        type: "conversation.item.create",
        item: { type: "text_input", text: prompt },
      };
      dataChannelRef.current.send(JSON.stringify(event));
      dataChannelRef.current.send(JSON.stringify({ type: "response.create" }));
      // Save user message to history
      saveConversationMessage("user", prompt);
      setConversationMessages(prev => [...prev, { role: 'user', content: prompt }]);
      toast({ title: "Prompt Sent", description: `Sent: "${prompt}"` });
    } else {
        toast({ title: "Assistant Not Ready", description: "Could not send prompt. Please try again.", variant: "destructive"});
    }
  };

  // Function to navigate content history (charts, profiles, statistics)
  const navigateToHistory = (index: number) => {
    if (index >= 0 && index < contentHistory.length) {
      // Determine slide direction based on index change
      if (index > currentHistoryIndex) {
        setSlideDirection('left'); // Newer content, slide from right to left
      } else if (index < currentHistoryIndex) {
        setSlideDirection('right'); // Older content, slide from left to right
      } else {
        setSlideDirection('none'); // Same content, no slide
      }

      setShowComponents(false); // Hide components for smooth transition
      const historyItem = contentHistory[index];

      // First timeout: Clear old states and let them render
      setTimeout(() => {
        // Clear all states first
        setChartData(null);
        setProfileData(null);
        setStatisticsData(null);
        setAnalysisData(null);
        setRecommendationTrendData(null);
        setEarningsCalendarData(null);
        setTrendingTickersData(null);
        setInsiderTransactionsData(null);
        setBalanceSheetData(null);
        setIncomeStatementDataState(null);
        setCashFlowDataState(null);

        // Second timeout: Restore new states after clearing has rendered
        setTimeout(() => {
          // Restore based on content type
          if (historyItem.type === "chart") {
            setChartData(historyItem.chartData || null);
            setMainStock(historyItem.mainStock || "");
            setSelectedStock(historyItem.selectedStock || "");
            setComparisonStocks(historyItem.comparisonStocks || []);
            setCurrentChartView(historyItem.viewMode || "price");
            setChartApiDetails(historyItem.apiCallDetails);
          } else if (historyItem.type === "profile") {
            setProfileData(historyItem.profileData);
            setProfileSymbol(historyItem.symbol);
            setProfileApiDetails(historyItem.apiCallDetails);
          } else if (historyItem.type === "statistics") {
            setStatisticsData(historyItem.statisticsData);
            setStatisticsSymbol(historyItem.symbol);
            setStatisticsApiDetails(historyItem.apiCallDetails);
          } else if (historyItem.type === "analysis") {
            setAnalysisData(historyItem.analysisData);
            setAnalysisSymbol(historyItem.symbol);
            setAnalysisApiDetails(historyItem.apiCallDetails);
          } else if (historyItem.type === "recommendation-trend") {
            setRecommendationTrendData(historyItem.recommendationTrendData);
            setRecommendationTrendSymbol(historyItem.symbol);
            setRecommendationTrendApiDetails(historyItem.apiCallDetails);
          } else if (historyItem.type === "earnings-calendar") {
            setEarningsCalendarData(historyItem.earningsCalendarData);
            setEarningsCalendarDateRange(historyItem.earningsCalendarDateRange || {});
            setEarningsCalendarApiDetails(historyItem.apiCallDetails);
          } else if (historyItem.type === "trending-tickers") {
            setTrendingTickersData(historyItem.trendingTickersData);
            setTrendingTickersRegion(historyItem.trendingTickersRegion || "US");
            setTrendingTickersApiDetails(historyItem.apiCallDetails);
          } else if (historyItem.type === "insider-transactions") {
            setInsiderTransactionsData(historyItem.insiderTransactionsData);
            setInsiderTransactionsSymbol(historyItem.symbol);
            setInsiderTransactionsApiDetails(historyItem.apiCallDetails);
          } else if (historyItem.type === "balance-sheet") {
            setBalanceSheetData(historyItem.balanceSheetData);
            setBalanceSheetSymbol(historyItem.symbol);
            setBalanceSheetApiDetails(historyItem.apiCallDetails);
          } else if (historyItem.type === "income-statement") {
            setIncomeStatementDataState(historyItem.incomeStatementData);
            setIncomeStatementSymbol(historyItem.symbol);
            setIncomeStatementApiDetails(historyItem.apiCallDetails);
          } else if (historyItem.type === "cash-flow") {
            setCashFlowDataState(historyItem.cashFlowData);
            setCashFlowSymbol(historyItem.symbol);
            setCashFlowApiDetails(historyItem.apiCallDetails);
          }

          setCurrentHistoryIndex(index);

          // Use requestAnimationFrame to ensure DOM has updated before showing
          requestAnimationFrame(() => {
            setShowComponents(true); // Show components to trigger animation
          });
        }, 75); // Second delay for state restoration
      }, 75); // First delay for state clearing
    }
  };

  // Handle navigation to previous content
  const navigateToPrevious = useCallback(() => {
    if (currentHistoryIndex > 0) {
      navigateToHistory(currentHistoryIndex - 1);
    }
  }, [currentHistoryIndex]);

  // Handle navigation to next content
  const navigateToNext = useCallback(() => {
    if (currentHistoryIndex < contentHistory.length - 1) {
      navigateToHistory(currentHistoryIndex + 1);
    }
  }, [currentHistoryIndex, contentHistory.length]);

  // Touch event handlers for swipe gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartXRef.current === null || contentHistory.length <= 1) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartXRef.current;

    // Minimum swipe distance threshold (adjust as needed)
    const minSwipeDistance = 50;

    if (diffX > minSwipeDistance) {
      // Swipe right -> Previous content
      navigateToPrevious();
    } else if (diffX < -minSwipeDistance) {
      // Swipe left -> Next content
      navigateToNext();
    }

    touchStartXRef.current = null;
  }, [navigateToPrevious, navigateToNext, contentHistory.length]);

  // Add this to the main function to include the CSS animation
  useEffect(() => {
    // Add the animation CSS to the document
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse-glow {
        0% { filter: drop-shadow(0 0 2px #ffe600); }
        50% { filter: drop-shadow(0 0 4px #ffe600); }
        100% { filter: drop-shadow(0 0 2px #ffe600); }
      }
      .animate-pulse-glow {
        animation: pulse-glow 2s infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background flex flex-col overflow-hidden">
      <header className="border-b border-border py-3 px-6 flex justify-between items-center bg-background">
        <div className="flex items-center gap-3">
          <Image
            src="/portfolio_ai_logo.png"
            alt="Portfolio AI Logo"
            width={40}
            height={40}
            className="rounded-md"
          />
          <h1 className="text-xl font-semibold text-foreground">
            Portfolio AI
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isHelpDialogOpen} onOpenChange={handleHelpDialogChange}>
            <DialogTrigger asChild>
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Help"
                  style={{ borderColor: '#47befb' }}
                  className={showHelpGlow ? 'help-button-glow' : ''}
                >
                  <HelpCircle className="h-[1.2rem] w-[1.2rem]" style={{ color: '#47befb' }} />
                </Button>
                {showHelpGlow && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs py-1.5 px-3 rounded-md whitespace-nowrap animate-bounce pointer-events-none">
                    👋 New here? Click for help!
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
                  </div>
                )}
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">About Portfolio AI Assistant</DialogTitle>
                <DialogDescription>
                  Learn what your AI-powered financial assistant can do
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">How It Works</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Portfolio AI is a voice-enabled financial assistant powered by Azure OpenAI's real-time API. Click the microphone sphere to start a voice conversation, or use the example prompts to see what it can do.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Get instant access to stock data from Yahoo Finance, including charts, company profiles, analyst insights, and trending tickers across global markets. All content is interactive - navigate through history, compare stocks, and click trending tickers to explore.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Available Tools & Capabilities</h3>
                  <div className="space-y-4">
                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-start gap-3">
                        <BarChart4 className="h-5 w-5 mt-0.5 text-primary" />
                        <div>
                          <h4 className="font-semibold text-sm">Stock Charts</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            View historical price data, compare multiple stocks, and analyze trends with customizable time ranges (1d, 1mo, 1y, etc.) and intervals.
                          </p>
                          <p className="text-xs text-primary mt-2 italic">
                            Example: "Show me Apple's stock price for the last 3 months"
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 mt-0.5 text-primary" />
                        <div>
                          <h4 className="font-semibold text-sm">Company Profiles</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Get detailed company information including sector, industry, location, employees, leadership, and business description.
                          </p>
                          <p className="text-xs text-primary mt-2 italic">
                            Example: "Tell me about NVIDIA's company profile"
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-start gap-3">
                        <BarChart4 className="h-5 w-5 mt-0.5 text-primary" />
                        <div>
                          <h4 className="font-semibold text-sm">Key Statistics</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Access financial metrics like P/E ratio, market cap, beta, profit margins, and growth rates.
                          </p>
                          <p className="text-xs text-primary mt-2 italic">
                            Example: "What are the key stats for Microsoft?"
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 mt-0.5 text-primary" />
                        <div>
                          <h4 className="font-semibold text-sm">Analyst Analysis</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            View comprehensive analyst recommendations, earnings estimates, price targets, and upgrade/downgrade history.
                          </p>
                          <p className="text-xs text-primary mt-2 italic">
                            Example: "Show me analyst recommendations for Tesla"
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-start gap-3">
                        <BarChart4 className="h-5 w-5 mt-0.5 text-primary" />
                        <div>
                          <h4 className="font-semibold text-sm">Recommendation Trends</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Track how analyst recommendations (Buy/Hold/Sell) have changed over time for any stock.
                          </p>
                          <p className="text-xs text-primary mt-2 italic">
                            Example: "What's the recommendation trend for Amazon?"
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 mt-0.5 text-primary" />
                        <div>
                          <h4 className="font-semibold text-sm">Earnings Calendar</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            View upcoming and recent earnings events with dates, EPS estimates, actual results, and surprise percentages.
                          </p>
                          <p className="text-xs text-primary mt-2 italic">
                            Example: "Show me upcoming earnings this week"
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 mt-0.5 text-primary" />
                        <div>
                          <h4 className="font-semibold text-sm">Trending Tickers</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Discover what stocks are trending with high trading activity across global markets. Click any ticker to instantly view its chart.
                          </p>
                          <p className="text-xs text-primary mt-2 italic">
                            Example: "What stocks are trending today?"
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 mt-0.5 text-primary" />
                        <div>
                          <h4 className="font-semibold text-sm">Insider Transactions</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Track insider buying and selling activity by company executives, directors, and major shareholders. View transaction types, shares traded, values, and net insider sentiment over the past 6 months.
                          </p>
                          <p className="text-xs text-primary mt-2 italic">
                            Example: "Show me insider transactions for Apple"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Tips & Features</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Use natural language - just ask questions like you would to a financial advisor</li>
                    <li>Compare multiple stocks by mentioning them together in one query</li>
                    <li>Navigate through your query history using the arrows, dot indicators, or swipe gestures</li>
                    <li>Switch between price, percent change, and relative performance views on charts</li>
                    <li>Click any trending ticker card to instantly load its detailed chart and information</li>
                    <li>Ask about global markets - supports US, GB, AU, IN, and many other regions</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-border mt-6">
                  <p className="text-xs text-center text-muted-foreground">
                    Built by <span className="font-medium text-foreground">Kabeer Thockchom</span>
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`border-r border-border transition-all duration-300 ${isSidebarCollapsed ? 'w-12' : 'w-80'} flex flex-col bg-card`}>
          <div className="flex justify-end p-3 border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Sidebar content */}
          <div className={`flex-1 flex flex-col p-4 ${isSidebarCollapsed ? 'hidden' : ''}`}>
            {/* Audio Visualizer */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="p-3 rounded-xl border border-border bg-muted/30">
                <AudioSphereVisualizer
                  isAssistantListening={isListening}
                  llmAudioElementRef={audioElementRef}
                  onStartAssistant={startAssistant}
                  onStopAssistant={stopAssistant}
                  canvasClassName="w-32 h-32 md:w-36 md:h-36 cursor-pointer"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {isListening
                  ? "Tap to mute"
                  : mounted && rtcHelpers
                  ? "Tap to speak"
                  : "Initializing..."}
              </p>
              <audio ref={audioElementRef} autoPlay className="hidden" />
            </div>

            {/* Chat Transcript */}
            <div className="flex flex-col mb-4 flex-1 min-h-0">
              <p className="text-sm font-medium mb-2 text-foreground">
                Transcript
              </p>
              <div className="overflow-y-auto flex-1 space-y-3 border border-border rounded-lg p-3 bg-muted/30 max-h-[400px]">
                {conversationMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`
                        text-sm p-3 rounded-lg max-w-[85%]
                        prose prose-sm dark:prose-invert
                        ${message.role === 'user'
                          ? 'bg-blue-500/20 border border-blue-500/30 text-foreground'
                          : 'bg-background border border-border text-muted-foreground'
                        }
                      `}
                    >
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
                {currentLlmMessage && (
                  <div className="flex justify-end">
                    <div className="text-sm p-3 rounded-lg max-w-[85%] bg-primary/10 border border-primary/30 text-foreground prose prose-sm dark:prose-invert">
                      <ReactMarkdown>{currentLlmMessage}</ReactMarkdown>
                    </div>
                  </div>
                )}
                {(conversationMessages.length === 0 && !currentLlmMessage) && (
                  <p className="text-xs text-muted-foreground text-center py-4">Conversation will appear here.</p>
                )}
                <div ref={transcriptEndRef} />
              </div>
            </div>

            {/* Example Prompts */}
            <div>
              <p className="text-sm font-medium mb-2 text-foreground">
                Example Prompts
              </p>
              <TypewriterBadges
                prompts={examplePrompts}
                onBadgeClick={handlePromptClick}
                containerClassName="flex flex-col gap-2"
                badgeClassName="bg-muted hover:bg-muted/80 text-foreground cursor-pointer transition-colors text-xs py-2 px-3 w-full text-left border border-border rounded-lg"
              />
            </div>
          </div>

          {/* Collapsed state only shows icons */}
          <div className={`flex-1 flex flex-col items-center py-4 ${!isSidebarCollapsed ? 'hidden' : ''}`}>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(false)} className="mb-4">
              <Mic className={`h-5 w-5 ${isListening ? 'text-primary' : 'text-muted-foreground'}`} />
            </Button>
          </div>
        </aside>
        
        {/* Main Content */}
        <div 
          className="flex-1 overflow-y-auto p-6" 
          ref={mainContentRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Content History Navigation */}
            {contentHistory.length > 1 && (
              <div className="flex items-center justify-center gap-3 mb-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={navigateToPrevious}
                  disabled={currentHistoryIndex <= 0}
                  aria-label="Previous content"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex space-x-2">
                  {contentHistory.map((_, index) => (
                    <button
                      key={`dot-${index}`}
                      onClick={() => navigateToHistory(index)}
                      className={`h-2 w-2 rounded-full transition-all duration-200 ${
                        currentHistoryIndex === index ? 'bg-primary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                      aria-label={`View content ${index + 1}`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={navigateToNext}
                  disabled={currentHistoryIndex >= contentHistory.length - 1}
                  aria-label="Next content"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Main Content Card - Shows Chart, Profile, Statistics, Analysis, Trending Tickers, or Financial Statements */}
            <div
              className={`transition-all duration-700 ease-out ${
                showComponents && (chartData || profileData || statisticsData || analysisData || recommendationTrendData || earningsCalendarData || trendingTickersData || insiderTransactionsData || balanceSheetData || incomeStatementDataState || cashFlowDataState)
                  ? "opacity-100 " +
                    (slideDirection === 'left'
                      ? 'animate-slide-in-from-right'
                      : slideDirection === 'right'
                        ? 'animate-slide-in-from-left'
                        : 'translate-y-0')
                  : "opacity-0 " +
                    (slideDirection === 'left'
                      ? 'translate-x-full'
                      : slideDirection === 'right'
                        ? '-translate-x-full'
                        : 'translate-y-8')
              }`}
            >
              {/* Show Chart */}
              {chartData && (
              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold">Stock Chart</h2>
                      <ApiCallDetails apiCallDetails={chartApiDetails} />
                    </div>
                    <select
                      id="chartView"
                      className="px-3 py-1.5 text-sm rounded-md border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                      value={currentChartView}
                      onChange={(e) => setCurrentChartView(e.target.value as "price" | "percent" | "relative")}
                    >
                      <option value="price">Price</option>
                      <option value="percent">Percent Change</option>
                      <option value="relative">Relative Performance</option>
                    </select>
                  </div>

                  {chartData && chartData.chart && chartData.chart.result && chartData.chart.result.length > 0 && (
                    <div className="flex flex-wrap justify-between items-center mb-4 text-xs gap-2">
                      <div className="bg-muted px-2.5 py-1 rounded-md border border-border">
                        <span className="font-medium text-muted-foreground">Interval:</span>{" "}
                        <span className="text-foreground">{chartData.chart.result[0].meta.dataGranularity || "1d"}</span>
                      </div>
                      <div className="bg-muted px-2.5 py-1 rounded-md border border-border">
                        <span className="font-medium text-muted-foreground">Range:</span>{" "}
                        <span className="text-foreground">{chartData.chart.result[0].meta.range || "1mo"}</span>
                      </div>
                    </div>
                  )}

                  {mainStock && (
                    <div id="stockSelector" className="flex flex-wrap gap-2 mb-4">
                      <Button
                        variant={selectedStock === mainStock ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedStock(mainStock)}
                      >
                        {mainStock}
                      </Button>
                      {comparisonStocks.map((symbol) => (
                        <Button
                          key={symbol}
                          variant={selectedStock === symbol ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedStock(symbol)}
                        >
                          {symbol}
                        </Button>
                      ))}
                    </div>
                  )}

                  <div id="chartContainer" className={`w-full min-h-[300px] rounded-lg overflow-hidden ${chartData && !isLoading ? "visible" : "hidden"}`}>
                    {chartData && !isLoading && <StockChart chartData={chartData} symbol={selectedStock} viewMode={currentChartView} />}
                    <div className="legend-container flex flex-wrap gap-2 mt-2"></div>
                  </div>

                  {!chartData && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-[300px] border border-dashed rounded-lg border-border bg-muted/30">
                      <BarChart4 className="w-10 h-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-sm">Ask the assistant to show you a stock chart</p>
                    </div>
                  )}

                  {isLoading && (
                    <div id="loadingIndicator" className="flex flex-col items-center justify-center h-[300px]">
                      <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin mb-2"></div>
                      <p className="text-muted-foreground text-sm">Loading chart data...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              )}

              {/* Show Profile */}
              {profileData && !chartData && (
                <StockProfileCard profileData={profileData} symbol={profileSymbol} apiCallDetails={profileApiDetails} />
              )}

              {/* Show Statistics */}
              {statisticsData && !chartData && !profileData && !analysisData && !recommendationTrendData && !earningsCalendarData && (
                <StockStatisticsCard statisticsData={statisticsData} symbol={statisticsSymbol} apiCallDetails={statisticsApiDetails} />
              )}

              {/* Show Analysis */}
              {analysisData && !chartData && !profileData && !statisticsData && !recommendationTrendData && !earningsCalendarData && (
                <StockAnalysisCard analysisData={analysisData} symbol={analysisSymbol} apiCallDetails={analysisApiDetails} />
              )}

              {/* Show Recommendation Trend */}
              {recommendationTrendData && !chartData && !profileData && !statisticsData && !analysisData && !earningsCalendarData && (
                <StockRecommendationTrendCard recommendationTrendData={recommendationTrendData} symbol={recommendationTrendSymbol} apiCallDetails={recommendationTrendApiDetails} />
              )}

              {/* Show Earnings Calendar */}
              {earningsCalendarData && !chartData && !profileData && !statisticsData && !analysisData && !recommendationTrendData && (
                <StockEarningsCalendarCard earningsCalendarData={earningsCalendarData} dateRange={earningsCalendarDateRange} apiCallDetails={earningsCalendarApiDetails} />
              )}

              {/* Show Trending Tickers */}
              {trendingTickersData && !chartData && !profileData && !statisticsData && !analysisData && !recommendationTrendData && !earningsCalendarData && !insiderTransactionsData && (
                <TrendingTickersCard
                  trendingTickersData={trendingTickersData}
                  region={trendingTickersRegion}
                  apiCallDetails={trendingTickersApiDetails}
                  onTickerClick={async (symbol: string) => {
                    setIsLoading(true);
                    setShowComponents(false);

                    const result = await fetchStockChart({ symbol, range: "1mo", interval: "1d" });

                    if (result.success && result.chartData) {
                      const newChartData = result.chartData;
                      setChartData(newChartData);
                      setMainStock(symbol);
                      setSelectedStock(symbol);
                      setComparisonStocks([]);
                      setTrendingTickersData(null); // Clear trending tickers view

                      // Add to history
                      setContentHistory(prevHistory => {
                        const newEntry: HistoryItem = {
                          type: "chart",
                          symbol: symbol,
                          chartData: newChartData,
                          mainStock: symbol,
                          selectedStock: symbol,
                          comparisonStocks: [],
                          viewMode: currentChartView,
                        };
                        const updatedHistory = [...prevHistory, newEntry];
                        setCurrentHistoryIndex(updatedHistory.length - 1);
                        return updatedHistory;
                      });

                      setTimeout(() => requestAnimationFrame(() => setShowComponents(true)), 150);
                    } else {
                      toast({
                        title: "Error loading chart",
                        description: result.error || "Failed to load chart data",
                        variant: "destructive"
                      });
                    }

                    setIsLoading(false);
                  }}
                />
              )}

              {/* Show Insider Transactions */}
              {insiderTransactionsData && !chartData && !profileData && !statisticsData && !analysisData && !recommendationTrendData && !earningsCalendarData && !trendingTickersData && !balanceSheetData && !incomeStatementDataState && !cashFlowDataState && (
                <StockInsiderTransactionsCard insiderTransactionsData={insiderTransactionsData} symbol={insiderTransactionsSymbol} apiCallDetails={insiderTransactionsApiDetails} />
              )}

              {/* Show Balance Sheet */}
              {balanceSheetData && !chartData && !profileData && !statisticsData && !analysisData && !recommendationTrendData && !earningsCalendarData && !trendingTickersData && !insiderTransactionsData && !incomeStatementDataState && !cashFlowDataState && (
                <StockBalanceSheetCard financialsData={balanceSheetData} symbol={balanceSheetSymbol} apiCallDetails={balanceSheetApiDetails} />
              )}

              {/* Show Income Statement */}
              {incomeStatementDataState && !chartData && !profileData && !statisticsData && !analysisData && !recommendationTrendData && !earningsCalendarData && !trendingTickersData && !insiderTransactionsData && !balanceSheetData && !cashFlowDataState && (
                <StockIncomeStatementCard financialsData={incomeStatementDataState} symbol={incomeStatementSymbol} apiCallDetails={incomeStatementApiDetails} />
              )}

              {/* Show Cash Flow */}
              {cashFlowDataState && !chartData && !profileData && !statisticsData && !analysisData && !recommendationTrendData && !earningsCalendarData && !trendingTickersData && !insiderTransactionsData && !balanceSheetData && !incomeStatementDataState && (
                <StockCashFlowCard financialsData={cashFlowDataState} symbol={cashFlowSymbol} apiCallDetails={cashFlowApiDetails} />
              )}

              {/* Show loading or empty state */}
              {!chartData && !profileData && !statisticsData && !analysisData && !recommendationTrendData && !earningsCalendarData && !trendingTickersData && !insiderTransactionsData && !balanceSheetData && !incomeStatementDataState && !cashFlowDataState && (
                <Card className="border-border">
                  <CardContent className="p-6">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center h-[300px]">
                        <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin mb-2"></div>
                        <p className="text-muted-foreground text-sm">Loading data...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[300px] border border-dashed rounded-lg border-border bg-muted/30">
                        <BarChart4 className="w-10 h-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground text-sm">Ask the assistant to show you stock data</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Stock Information Panel - Only show for charts */}
            {chartData && (
              <div
                className={`transition-all duration-700 ease-out delay-100 ${
                  showComponents && chartData
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <Card className="border-border">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Stock Information</h2>
                    {chartData.chart && chartData.chart.result && chartData.chart.result.length > 0 && selectedStock ? (
                      <div className="grid grid-cols-1 gap-4">
                        <StockInfoPanel stock={selectedStock} chartData={chartData} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[200px] border border-dashed rounded-lg border-border bg-muted/30">
                        <Info className="w-10 h-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground text-center text-sm">
                          Select a stock or ask the assistant for details.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-3 px-6 bg-background">
        <p className="text-xs text-center text-muted-foreground">
          Built by <span className="font-medium text-foreground">Kabeer Thockchom</span>
        </p>
      </footer>
    </main>
  )
}