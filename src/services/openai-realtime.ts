import { RealtimeEvent } from "@/types";

type EventCallback = (event: RealtimeEvent) => void;

export interface RealtimeSession {
  startSession: () => Promise<string>;
  stopSession: () => void;
  sendClientEvent: (message: any) => void;
  audioStream: MediaStream | null;
}

export class OpenAIRealtimeService {
  private peerConnection: RTCPeerConnection | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private audioStream: MediaStream | null = null;
  private sessionId: string | null = null;
  private eventCallback: EventCallback | null = null;

  constructor(eventCallback?: EventCallback) {
    this.eventCallback = eventCallback || null;
  }

  async startSession(): Promise<string> {
    // Get an ephemeral key
    const tokenResponse = await fetch("/api/session");
    const data = await tokenResponse.json();
    const EPHEMERAL_KEY = data.client_secret.value;
    this.sessionId = crypto.randomUUID().slice(0, 8);

    // Create a peer connection
    const pc = new RTCPeerConnection();

    // Set up to play remote audio from the model
    this.audioElement = document.createElement("audio");
    this.audioElement.autoplay = true;
    pc.ontrack = (e) => (this.audioElement!.srcObject = e.streams[0]);

    // Add local audio track for microphone input in the browser
    const ms = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    this.audioStream = ms;
    pc.addTrack(ms.getTracks()[0]);

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel("oai-events");
    this.dataChannel = dc;

    // Set up data channel event handlers
    dc.addEventListener("message", (e) => {
      const event = JSON.parse(e.data) as RealtimeEvent;

      if (this.eventCallback) {
        this.eventCallback(event);
      }
    });

    dc.addEventListener("open", () => {
      if (this.eventCallback) {
        this.eventCallback({
          type: "session.started",
          sessionId: this.sessionId,
        });
      }
    });

    // Start the session using the Session Description Protocol (SDP)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-realtime-preview-2024-12-17";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp",
      },
    });

    const answer: RTCSessionDescriptionInit = {
      type: "answer" as const,
      sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);

    this.peerConnection = pc;
    return this.sessionId;
  }

  stopSession(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
    }

    if (this.peerConnection) {
      this.peerConnection.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      this.peerConnection.close();
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }

    this.dataChannel = null;
    this.peerConnection = null;

    if (this.eventCallback && this.sessionId) {
      this.eventCallback({
        type: "session.stopped",
        sessionId: this.sessionId,
      });
    }
  }

  sendClientEvent(message: any): void {
    if (this.dataChannel) {
      this.dataChannel.send(JSON.stringify(message));

      if (this.eventCallback) {
        this.eventCallback(message as RealtimeEvent);
      }
    } else {
      console.error(
        "Failed to send message - no data channel available",
        message
      );
    }
  }

  getAudioStream(): MediaStream | null {
    return this.audioStream;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }
}
