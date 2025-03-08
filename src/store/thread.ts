import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Message, LanguageCode } from "@/types";

interface ThreadState {
  messages: Message[];
  clinicianLanguage: LanguageCode;
  patientLanguage: LanguageCode | null;
  isSessionActive: boolean;
}

const initialState: ThreadState = {
  messages: [],
  clinicianLanguage: "en",
  patientLanguage: null,
  isSessionActive: false,
};

// Async thunk to save a message to Supabase
export const saveMessage = createAsyncThunk(
  'thread/saveMessage',
  async (message: Message, { rejectWithValue, getState }) => {
    console.log("saveMessage", message);
    try {
      if (!message.visitId) {
        console.error('Error saving message to Supabase: visitId is required');
        return rejectWithValue('visitId is required');
      }

      // Persist the message to Supabase
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: message.visitId,
          isClinician: message.isClinician,
          originalText: message.originalText,
          originalLanguage: message.originalLanguage,
          translatedText: message.translatedText,
          translatedLanguage: message.translatedLanguage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error saving message:', error);
        return rejectWithValue(error.message);
      }

      const data = await response.json();
      
      console.log('Message successfully saved to Supabase:', data);
      return message;
    } catch (error) {
      console.error('Error in saveMessage:', error);
      return rejectWithValue('Failed to save message');
    }
  }
);

const threadSlice = createSlice({
  name: "thread",
  initialState,
  reducers: {
    setClinicianLanguage: (state, action: PayloadAction<LanguageCode>) => {
      state.clinicianLanguage = action.payload;
    },
    setPatientLanguage: (state, action: PayloadAction<LanguageCode>) => {
      console.log("setPatientLanguage", action.payload);
      state.patientLanguage = action.payload;
    },
    setSessionActive: (state, action: PayloadAction<boolean>) => {
      state.isSessionActive = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveMessage.fulfilled, (state, action) => {
        // Add the message to the store when successfully saved to Supabase
        console.log("saveMessage.fulfilled", action.payload);
        state.messages.push(action.payload);
      });
  },
});

export const {
  setClinicianLanguage,
  setPatientLanguage,
  setSessionActive,
} = threadSlice.actions;

export default threadSlice.reducer;
