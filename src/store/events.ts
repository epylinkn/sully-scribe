import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RealtimeEvent } from '@/types';

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
      // NB. Only interested in response.done events for now
      if (action.payload.type === "response.done") {
        state.events.unshift(action.payload); // Add new events to the start
      }
    },
    clearEvents: (state) => {
      state.events = [];
    },
  },
});

export const { addEvent, clearEvents } = eventsSlice.actions;

export default eventsSlice.reducer; 
