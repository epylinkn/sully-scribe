import { useState } from "react";
import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  icon?: ReactNode;
  className?: string;
}

function Button({ children, onClick, icon, className }: ButtonProps) {
  return (
    <button onClick={onClick} className={className}>
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
    <div className="flex items-center justify-center w-full h-full">
      <Button
        onClick={handleStartSession}
        className={isActivating ? "bg-gray-600" : "bg-red-600"}
      >
        {isActivating ? "starting session..." : "start session"}
      </Button>
    </div>
  );
}

function SessionActive({ stopSession }: { stopSession: () => void }) {
  return (
    <div className="flex items-center justify-center w-full h-full gap-4">
      <Button 
        onClick={stopSession}
        className="bg-red-500 hover:bg-red-600"
      >
        Stop Recording
      </Button>
    </div>
  );
}

interface SessionControlsProps {
  startSession: () => void;
  stopSession: () => void;
  isSessionActive: boolean;
}

export default function SessionControls({
  startSession,
  stopSession,
  isSessionActive,
}: SessionControlsProps) {
  return (
    <div className="flex gap-4 border-t-2 border-gray-200 h-full rounded-md">
      {isSessionActive ? (
        <SessionActive stopSession={stopSession} />
      ) : (
        <SessionStopped startSession={startSession} />
      )}
    </div>
  );
}
