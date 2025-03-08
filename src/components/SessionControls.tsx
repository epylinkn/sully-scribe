import { useState } from "react";
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import AudioWave from './AudioWave';
import Timer from './Timer';

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  icon?: ReactNode;
  className?: string;
}

function Button({ children, onClick, icon, className }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-full font-medium text-white transition-all duration-200 flex items-center gap-2 ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

function SessionStopped({ startSession }: { startSession: () => void }) {
  const [isActivating, setIsActivating] = useState(false);

  function handleStartSession() {
    if (isActivating) return;
    setIsActivating(true);
    startSession();
  }

  return (
    <div className="flex items-center gap-4 flex-1">
      <Button
        onClick={handleStartSession}
        className={isActivating
          ? "bg-gray-500 hover:bg-gray-600 cursor-wait"
          : "bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl"
        }
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        }
      >
        {isActivating ? "Starting session..." : "Start Recording"}
      </Button>
    </div>
  );
}

function SessionActive({ stopSession }: { stopSession: () => void }) {
  return (
    <div className="flex items-center gap-4 flex-1">
      <Button
        onClick={stopSession}
        className="bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
        }
      >
        End Visit
      </Button>
    </div>
  );
}

interface SessionControlsProps {
  startSession: () => void;
  stopSession: () => void;
  stream?: MediaStream | null;
}

export default function SessionControls({
  startSession,
  stopSession,
  stream,
}: SessionControlsProps) {
  const isSessionActive = useSelector((state: RootState) => state.thread.isSessionActive);

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center bg-pink-50 rounded-full px-4 py-2 border border-pink-100">
          <Timer isActive={isSessionActive} />
        </div>
        <div className="flex-1 flex gap-4">
          {isSessionActive ? (
            <SessionActive stopSession={stopSession} />
          ) : (
            <SessionStopped startSession={startSession} />
          )}

          <div className="flex-1">
            <AudioWave isActive={isSessionActive} stream={stream} />
          </div>
        </div>
      </div>
    </div>
  );
}
