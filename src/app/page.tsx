'use client'

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SessionControls from '@/components/SessionControls';
import { addEvent, clearEvents } from '@/store/events';
import { setClinicianLanguage, setPatientLanguage, setSessionActive, saveMessage } from '@/store/thread';
import Sidebar from '@/components/Sidebar';
import Messages from '@/components/Messages';
import { useRouter } from 'next/navigation';
import { LanguageCode, RealtimeEvent } from '@/types';
import { OpenAIRealtimeService } from '@/services/openai-realtime';
import EventLog from '@/components/EventLog';
import type { RootState } from '@/store';

export default function PatientView() {
  const dispatch = useDispatch();
  const router = useRouter();
  const events: RealtimeEvent[] = useSelector((state: RootState) => state.events.events)
  const clinicianLanguage = useSelector((state: RootState) => state.thread.clinicianLanguage);
  const patientLanguage = useSelector((state: RootState) => state.thread.patientLanguage);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [realtimeService] = useState(() => new OpenAIRealtimeService((event) => dispatch(addEvent(event))));

  async function startSession() {
    dispatch(setSessionActive(true));
    dispatch(clearEvents());

    const newSessionId = await realtimeService.startSession();
    setSessionId(newSessionId);
    setAudioStream(realtimeService.getAudioStream());

    // Create a new visit
    await fetch('/api/visits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId: newSessionId })
    });
  }

  async function stopSession() {
    realtimeService.stopSession();
    setAudioStream(null);
    dispatch(setSessionActive(false));

    if (sessionId) {
      // End the visit
      await fetch('/api/visits', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          clinicianLanguage: clinicianLanguage,
          patientLanguage: patientLanguage,
        })
      });

      router.push(`/summary/${sessionId}`);
    } else {
      throw new Error("Session ID is not set");
    }
  }

  useEffect(() => {
    if (!events || events.length === 0) return;

    const latestEvent = events[0];
    if (latestEvent.type === "response.done" && latestEvent.response?.output) {
      latestEvent.response.output.forEach((output: any) => {
        if (output.type === "function_call") {
          switch (output.name) {
            case "setLanguage":
              const args = JSON.parse(output.arguments || '{}');
              console.log("setLanguage", args);
              dispatch(setClinicianLanguage(args.clinicianLanguage as LanguageCode));
              dispatch(setPatientLanguage(args.patientLanguage as LanguageCode));
              break;
            case "processMessageTranslation":
              if (sessionId) {
                const messageArgs = JSON.parse(output.arguments || '{}');
                const newMessage = {
                  visitId: sessionId,
                  isClinician: messageArgs.isClinician,
                  originalText: messageArgs.originalText,
                  originalLanguage: messageArgs.originalLanguage as LanguageCode,
                  translatedText: messageArgs.translatedText ?? null,
                  translatedLanguage: messageArgs.translatedLanguage as LanguageCode ?? null,
                };
                dispatch(saveMessage(newMessage) as any);
                
              } else {
                console.error("Session ID is not set");
              }
              break;
          }
        }
      });
    }
  }, [events, dispatch, sessionId]);

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
            <Messages />
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
          <Sidebar sessionId={sessionId || ''} />
          <EventLog events={events} />
        </section>
      </main>
    </>
  );
}
