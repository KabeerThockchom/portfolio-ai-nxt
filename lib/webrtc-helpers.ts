// lib/webrtc-helpers.ts

export function createPeerConnection(): RTCPeerConnection {
  if (typeof window === 'undefined' || typeof RTCPeerConnection === 'undefined') {
    throw new Error("RTCPeerConnection is not available in this environment.");
  }
  return new RTCPeerConnection();
}

export async function getUserAudioMedia(): Promise<MediaStream> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("navigator.mediaDevices.getUserMedia is not available in this environment.");
  }
  return navigator.mediaDevices.getUserMedia({ audio: true });
} 