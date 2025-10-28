import { useState, useRef } from "react";
import { RtcHelpersModule } from "@/types";

// Hook for managing voice session and WebRTC state
export function useVoiceSession() {
  const [isListening, setIsListening] = useState(false);
  const [rapidApiKey, setRapidApiKey] = useState("");
  const [mounted, setMounted] = useState(false);
  const [rtcHelpers, setRtcHelpers] = useState<RtcHelpersModule | null>(null);

  // WebRTC refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  return {
    // State
    isListening,
    rapidApiKey,
    mounted,
    rtcHelpers,

    // Setters
    setIsListening,
    setRapidApiKey,
    setMounted,
    setRtcHelpers,

    // Refs
    peerConnectionRef,
    dataChannelRef,
    audioElementRef,
  };
}
