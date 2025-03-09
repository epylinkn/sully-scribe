import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RealtimeEvent {
  type: string;
  response?: {
    output?: Array<{
      type: string;
      name?: string;
      arguments?: string;
    }>;
  };
  event_id: string;
}

interface EventsState {
  events: RealtimeEvent[];
}

const initialState: EventsState = {
  events: [],
};

export const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    addEvent: (state, action: PayloadAction<RealtimeEvent>) => {
      state.events.unshift(action.payload); // Add new events to the start
    },
    clearEvents: (state) => {
      state.events = [];
    },
  },
});

export const { addEvent, clearEvents } = eventsSlice.actions;

export default eventsSlice.reducer; 
