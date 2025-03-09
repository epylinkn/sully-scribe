import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message, LanguageCode } from "@/types";
import { db } from "@/tools/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

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

const threadSlice = createSlice({
  name: "thread",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
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
});

export const {
  addMessage,
  setClinicianLanguage,
  setPatientLanguage,
  setSessionActive,
} = threadSlice.actions;

export const saveMessageToFirebase = (message: Message) => {
  console.log("saveMessageToFirebase", message);
  const payload = {
    ...message,
    createdAt: Timestamp.now(),
  };

  const messagesRef = collection(db, "messages");
  addDoc(messagesRef, payload).catch((error) => {
    console.error("Error adding message to Firebase:", error);
  });
  return { type: "thread/saveMessageToFirebase" }; // Return an action object
};

export default threadSlice.reducer;
