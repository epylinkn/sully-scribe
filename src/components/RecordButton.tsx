'use client';

import { useState, useCallback } from 'react';

interface Session {
  id: string;
  token: string;
  expires_at: string;
  urls: {
    ws: string;
    https: string;
  };
}

export function RecordButton() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Get session token
      const response = await fetch('/api/session');
      if (!response.ok) {
        throw new Error('Failed to get session token');
      }
      const session: Session = await response.json();

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);

      // Create and configure peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      // Add audio track to peer connection
      stream.getAudioTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Set up WebSocket connection
      const ws = new WebSocket(session.urls.ws);
      
      ws.onopen = async () => {
        // Send authentication
        ws.send(JSON.stringify({
          type: 'authenticate',
          token: session.token
        }));

        // Create and send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.send(JSON.stringify({
          type: 'sdp',
          sdp: pc.localDescription
        }));
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'sdp') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        } else if (data.type === 'ice') {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          ws.send(JSON.stringify({
            type: 'ice',
            candidate: event.candidate
          }));
        }
      };

      setPeerConnection(pc);
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      stopRecording();
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    
    setIsRecording(false);
  }, [mediaStream, peerConnection]);

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`
          px-6 py-3 rounded-full font-medium text-white
          transition-colors duration-200
          ${isRecording 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
          }
        `}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
} 
