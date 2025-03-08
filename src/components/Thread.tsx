import { useState } from "react";

interface AudioTranscriptEvent {
  type: string;
  audio_transcript?: {
    text: string;
  };
  transcript?: string;
  event_id: string;
}

function TranscriptMessage({ event, timestamp }: { event: AudioTranscriptEvent; timestamp: string }) {
  const isUserMessage = event.event_id && !event.event_id.startsWith("event_");
  const text = event.transcript || '';
  const isPartial = event.type === "audio_transcript.partial";

  return (
    <div 
      className={`
        flex flex-col gap-2 p-6 rounded-2xl shadow-sm max-w-3xl mx-auto w-full
        ${isUserMessage 
          ? 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100' 
          : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium
          ${isUserMessage ? 'bg-blue-500' : 'bg-gray-700'}
        `}>
          {isUserMessage ? 'Y' : 'A'}
        </div>
        <span className="font-semibold text-gray-900">
          {isUserMessage ? 'You' : 'Assistant'}
        </span>
        <span className="text-sm text-gray-500">
          {timestamp}
        </span>
        {isPartial && (
          <span className="
            text-xs px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 
            rounded-full font-medium animate-pulse
          ">
            transcribing...
          </span>
        )}
      </div>
      <div className={`
        pl-11 text-gray-700 whitespace-pre-wrap
        ${!isPartial ? 'text-gray-900' : 'text-gray-600 italic'}
      `}>
        {text || 'Processing audio...'}
      </div>
    </div>
  );
}

export default function Thread({ events }: { events: AudioTranscriptEvent[] }) {
  const transcriptEvents = events.filter(event => 
    event.type === "audio_transcript.partial" || 
    event.type === "audio_transcript.final" ||
    event.type === "response.audio_transcript.done"
  );

  if (transcriptEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <p className="text-lg font-medium">No transcripts yet</p>
        <p className="text-sm text-gray-400">Start speaking to begin the conversation</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {transcriptEvents.map((event) => (
        <TranscriptMessage
          key={event.event_id}
          event={event}
          timestamp={new Date().toLocaleTimeString()}
        />
      ))}
    </div>
  );
}
