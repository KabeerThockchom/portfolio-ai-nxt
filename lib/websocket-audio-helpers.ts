/**
 * WebSocket Audio Helpers for Azure OpenAI Realtime API
 *
 * Handles audio input/output for WebSocket-based real-time conversations
 */

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
}

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  sampleRate: 24000,
  channels: 1,
  bitsPerSample: 16,
};

/**
 * Convert Float32Array audio data to base64 PCM16
 */
export function float32ToPCM16Base64(float32Array: Float32Array): string {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);

  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  const uint8Array = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }

  return btoa(binary);
}

/**
 * Convert base64 PCM16 to Float32Array for playback
 */
export function pcm16Base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const dataView = new DataView(bytes.buffer);
  const float32Array = new Float32Array(bytes.length / 2);

  for (let i = 0; i < float32Array.length; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    float32Array[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7fff;
  }

  return float32Array;
}

/**
 * Audio Input Handler - captures microphone input and sends to WebSocket
 */
export class AudioInputHandler {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private stream: MediaStream | null = null;

  constructor(
    private websocket: WebSocket,
    private config: AudioConfig = DEFAULT_AUDIO_CONFIG
  ) {}

  async start(): Promise<void> {
    console.log("🎤 Requesting microphone access...");
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("🎤 Microphone access granted");

    this.audioContext = new AudioContext({ sampleRate: this.config.sampleRate });
    console.log("🎤 AudioContext created, sample rate:", this.audioContext.sampleRate);

    this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
    console.log("🎤 Media stream source created");

    // Use ScriptProcessor for compatibility (will be deprecated in favor of AudioWorklet)
    this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);

    let chunkCount = 0;
    this.processorNode.onaudioprocess = (event) => {
      if (this.websocket.readyState === WebSocket.OPEN) {
        const inputData = event.inputBuffer.getChannelData(0);
        const base64Audio = float32ToPCM16Base64(inputData);

        chunkCount++;
        if (chunkCount % 50 === 0) {
          console.log("🎤 Sent", chunkCount, "audio chunks, latest size:", base64Audio.length);
        }

        this.websocket.send(JSON.stringify({
          type: "input_audio_buffer.append",
          audio: base64Audio
        }));
      }
    };

    this.sourceNode.connect(this.processorNode);
    this.processorNode.connect(this.audioContext.destination);
    console.log("🎤 Audio input pipeline connected and running");
  }

  stop(): void {
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  mute(): void {
    if (this.stream) {
      this.stream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
    }
  }

  unmute(): void {
    if (this.stream) {
      this.stream.getAudioTracks().forEach(track => {
        track.enabled = true;
      });
    }
  }
}

/**
 * Audio Output Handler - receives audio from WebSocket and plays it
 */
export class AudioOutputHandler {
  private audioContext: AudioContext | null = null;
  private audioQueue: Float32Array[] = [];
  private isPlaying = false;

  constructor(private config: AudioConfig = DEFAULT_AUDIO_CONFIG) {}

  async initialize(): Promise<void> {
    this.audioContext = new AudioContext({ sampleRate: this.config.sampleRate });
    console.log("🎵 AudioContext initialized:", {
      sampleRate: this.audioContext.sampleRate,
      state: this.audioContext.state
    });

    // Resume AudioContext if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log("🎵 AudioContext resumed");
    }
  }

  addAudio(base64Audio: string): void {
    if (!this.audioContext) {
      console.error("❌ No AudioContext available");
      return;
    }

    console.log("🎵 Decoding audio, base64 length:", base64Audio.length);

    try {
      const float32Array = pcm16Base64ToFloat32(base64Audio);
      console.log("🎵 Decoded to Float32Array, length:", float32Array.length);

      this.audioQueue.push(float32Array);
      console.log("🎵 Audio queue length:", this.audioQueue.length);

      if (!this.isPlaying) {
        console.log("🎵 Starting playback");
        this.playNextChunk();
      }
    } catch (error) {
      console.error("❌ Error decoding audio:", error);
    }
  }

  private async playNextChunk(): Promise<void> {
    if (!this.audioContext || this.audioQueue.length === 0) {
      this.isPlaying = false;
      console.log("🎵 Playback finished, queue empty");
      return;
    }

    this.isPlaying = true;
    const audioData = this.audioQueue.shift()!;

    console.log("🎵 Playing chunk, samples:", audioData.length, "duration:", audioData.length / this.config.sampleRate + "s");

    const audioBuffer = this.audioContext.createBuffer(
      this.config.channels,
      audioData.length,
      this.config.sampleRate
    );

    audioBuffer.getChannelData(0).set(audioData);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    source.onended = () => {
      console.log("🎵 Chunk finished, playing next");
      this.playNextChunk();
    };

    console.log("🎵 Starting audio source");
    source.start();
  }

  stop(): void {
    this.audioQueue = [];
    this.isPlaying = false;

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
