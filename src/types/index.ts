export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi' | 'bn' | 'other';

export interface Visit {
  id?: string;
  clinicianLanguage?: LanguageCode;
  patientLanguage?: LanguageCode;
  summary?: string;
  toolCalls?: string; //jsonb

  createdAt?: Date;
  endedAt?: Date;
  analyzedAt?: Date;
  updatedAt?: Date;
}

export interface Message {
  id?: string;
  visitId?: string;
  isClinician: boolean;
  originalLanguage: LanguageCode;
  originalText: string;
  translatedLanguage: LanguageCode | null;
  translatedText: string | null;

  createdAt?: Date;
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

export interface RealtimeEvent {
  type: string;
  response?: {
    output?: Array<{
      type: string;
      name?: string;
      arguments?: string;
    }>;
  };
  [key: string]: any;
}

/**
 * Interface for tool schema metadata
 */
export interface ToolMetadata {
  category?: string;
  triggerCriteria?: string;
  exampleTriggers?: string[];
}

/**
 * Interface for tool schemas
 */
export interface ToolSchema {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  metadata?: ToolMetadata;
}
