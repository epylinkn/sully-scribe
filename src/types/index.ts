import { Timestamp } from "firebase/firestore";

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi' | 'bn' | 'other';

export interface Message {
  id?: string;
  isClinician: boolean;
  language: LanguageCode;
  original: string;
  translated: string;
  createdAt: Timestamp;
}

// This is just for type checking - the actual RootState is defined in store/index.ts
export interface RootState {
  // OpenAI Realtime events
  events: {
    events: Event[];
    isSessionActive: boolean;
  };
  messages: {
    messages: Message[];
  };
} 
