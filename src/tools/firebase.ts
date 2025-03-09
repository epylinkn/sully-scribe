// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "sully-scribe.firebaseapp.com",
  databaseURL: "https://sully-scribe-default-rtdb.firebaseio.com",
  projectId: "sully-scribe",
  storageBucket: "sully-scribe.firebasestorage.app",
  messagingSenderId: "189750448083",
  appId: "1:189750448083:web:970790dfe5b2f2c101a926"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
