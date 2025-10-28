// Voice session and WebRTC type definitions

// Define the type for the dynamically imported module
export type RtcHelpersModule = typeof import('@/lib/webrtc-helpers');

// Conversation message type
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}
