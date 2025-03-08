import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AudioTranscriptEvent {
  type: string;
  audio_transcript?: {
    text: string;
  };
  response?: {
    audio_transcript?: {
      text: string;
    };
    output?: Array<{
      type: string;
      name?: string;
      arguments?: string;
    }>;
  };
  event_id: string;
}

interface EventsState {
  events: AudioTranscriptEvent[];
  isSessionActive: boolean;
}

const initialState: EventsState = {
  events: [],
  isSessionActive: false,
};

export const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    addEvent: (state, action: PayloadAction<AudioTranscriptEvent>) => {
      state.events.unshift(action.payload); // Add new events to the start
    },
    clearEvents: (state) => {
      state.events = [];
    },
    setSessionActive: (state, action: PayloadAction<boolean>) => {
      state.isSessionActive = action.payload;
    },
  },
});

export const { addEvent, clearEvents, setSessionActive } = eventsSlice.actions;

export default eventsSlice.reducer; 
