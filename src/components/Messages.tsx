import { useEffect, useRef, useState } from "react";
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import MessageBubble from "./MessageBubble";

export default function Messages() {
  const isSessionActive = useSelector((state: RootState) => state.thread.isSessionActive);
  const clinicianLanguage = useSelector((state: RootState) => state.thread.clinicianLanguage);
  const patientLanguage = useSelector((state: RootState) => state.thread.patientLanguage);
  const messages = useSelector((state: RootState) => state.thread.messages);
  const events = useSelector((state: RootState) => state.events.events);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [lastAudioUrl, setLastAudioUrl] = useState<string | null>(null);
  const [lastAudioBlob, setLastAudioBlob] = useState<Blob | null>(null);

  // Handle repeat audio events
  useEffect(() => {
    if (!events || events.length === 0) return;
    
    const latestEvent = events[0]; // Events are added at the beginning of the array
    
    if (latestEvent.type === "tool.call" && 
        latestEvent.response?.output?.[0]?.name === "repeatAudio") {
      replayLastAudio();
    }
  }, [events]);

  // Function to replay the last audio
  const replayLastAudio = () => {
    if (!audioRef.current || !lastAudioUrl) return;
    
    console.log("Replaying last audio...");
    
    // Reset audio to beginning and play it again
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(error => {
      console.error("Error replaying audio:", error);
    });
  };

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage.translatedText) return;

    const playAudio = async () => {
      try {
        // Create a new audio element if one doesn't exist
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        // Determine which language to use for TTS; 
        // If not translated, use the original text (likely english)
        const text = latestMessage.translatedText || latestMessage.originalText;

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate speech');
        }

        const audioBlob = await response.blob();
        setLastAudioBlob(audioBlob);
        
        // Clean up previous audio URL if it exists
        if (lastAudioUrl) {
          URL.revokeObjectURL(lastAudioUrl);
        }
        
        const audioUrl = URL.createObjectURL(audioBlob);
        setLastAudioUrl(audioUrl);

        // Set the audio source and play
        audioRef.current.src = audioUrl;
        audioRef.current.play();

        // We don't revoke the URL on end since we need it for replay
      } catch (error) {
        console.error('Error playing TTS audio:', error);
      }
    };

    playAudio();
  }, [messages, clinicianLanguage, patientLanguage]);

  // Clean up audio URLs when component unmounts
  useEffect(() => {
    return () => {
      if (lastAudioUrl) {
        URL.revokeObjectURL(lastAudioUrl);
      }
    };
  }, [lastAudioUrl]);

  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="h-full bg-gray-50 rounded-md p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Messages</h2>

        {messages.length > 0 ? (
          <div className="flex flex-col">
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
          </div>
        ) : isSessionActive ? (
          <p>Waiting for speech...</p>
        ) : (
          <p>Waiting for clinician and patient language...</p>
        )}
      </div>
    </section>
  );
}
