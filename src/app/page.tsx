'use client'

import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import SessionControls from '@/components/SessionControls';
import { addEvent, clearEvents } from '@/store/events';
import { setSessionActive } from '@/store/thread';
import Sidebar from '@/components/Sidebar';
import Messages from '@/components/Messages';
import { useRouter } from 'next/navigation';

export default function PatientView() {
  const dispatch = useDispatch();
  const router = useRouter();
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  async function startSession() {
    // Get an ephemeral key
    const tokenResponse = await fetch("/api/session");
    const data = await tokenResponse.json();
    const EPHEMERAL_KEY = data.client_secret.value;
    setSessionId(crypto.randomUUID());

    // Create a peer connection
    const pc = new RTCPeerConnection();

    // Set up to play remote audio from the model
    audioElement.current = document.createElement("audio");
    audioElement.current.autoplay = true;
    pc.ontrack = (e) => (audioElement.current!.srcObject = e.streams[0]);

    // Add local audio track for microphone input in the browser
    const ms = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    setAudioStream(ms);
    pc.addTrack(ms.getTracks()[0]);

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel("oai-events");
    dataChannelRef.current = dc;

    // Set up data channel event handlers
    dc.addEventListener("message", (e) => {
      const event = JSON.parse(e.data);
      const includeEvents = [
        "response.done",
        "conversation.updated",
        "conversation.created",
        "conversation.deleted",
        "conversation.transcribed",
        "converasation.item.created",
        "converasation.item.updated",
        "converasation.item.deleted",
        "session.created",
        "session.updated",
        "session.deleted",
      ]
      
      if (!includeEvents.includes(event.type)) {
        return;
      }

      dispatch(addEvent(event));
    });

    dc.addEventListener("open", () => {
      dispatch(setSessionActive(true));
      dispatch(clearEvents());
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
      type: 'answer' as const,
      sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);

    peerConnection.current = pc;
  }

  function stopSession() {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
    }

    if (peerConnection.current) {
      peerConnection.current.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      peerConnection.current.close();
    }

    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }

    dataChannelRef.current = null;
    peerConnection.current = null;
    
    // End the session in db
    fetch('/api/end-visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId: sessionId }),
    }).then(res => res.json()).then(data => {
      console.log(data);
      router.push(`/summary/${sessionId}`);
      router.refresh(); // HACK: Refresh the page to get the new summary
    });
  }
  
  // Send a message to the server, e.g. prompt update instructions
  function sendClientEvent(message: any) {
    if (dataChannelRef.current) {
      message.event_id = message.event_id || crypto.randomUUID();
      dataChannelRef.current.send(JSON.stringify(message));
      dispatch(addEvent(message));
    } else {
      console.error(
        "Failed to send message - no data channel available",
        message,
      );
    }
  }
  
  return (
    <>
      <nav className="absolute top-0 left-0 right-0 h-16 flex items-center">
        <div className="flex items-center gap-4 w-full m-4 pb-2 border-0 border-b border-solid border-gray-200">
          <h1>Sully Assistant</h1>
        </div>
      </nav>
      
      <main className="absolute top-16 left-0 right-0 bottom-0">
        <section className="absolute top-0 left-0 right-[380px] bottom-0 flex">
          <section className="absolute top-0 left-0 right-0 bottom-32 px-4 overflow-y-auto">
            {/* <EventLog /> */}
            <Messages sendClientEvent={sendClientEvent} />
          </section>
          <section className="absolute h-32 left-0 right-0 bottom-0 p-4">
            <SessionControls
              startSession={startSession}
              stopSession={stopSession}
              stream={audioStream}
            />
          </section>
        </section>
        <section className="absolute top-0 w-[380px] right-0 bottom-0 p-4 pt-0 overflow-y-auto">
          <Sidebar />
        </section>
      </main>
    </>
  );
}
