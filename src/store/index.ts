import { configureStore } from '@reduxjs/toolkit';
import eventsReducer from './events';
import threadReducer from './thread';

export const store = configureStore({
  reducer: {
    events: eventsReducer,
    thread: threadReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
