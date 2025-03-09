import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/tools/firebase";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST request
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("Ending visit:", data);
    const sessionId = data.sessionId;
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    // Query all messages from Firestore
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);

    // Convert Firestore documents to message objects
    const messages = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        isClinician: data.isClinician,
        original: data.original,
        translated: data.translated,
        language: data.language,
        createdAt:
          data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      };
    });

    // For simplicity, we'll treat all messages as one conversation
    // In a real app, you might want to group by session ID or other criteria
    const conversation = messages
      .map(
        (msg) => `${msg.isClinician ? "Clinician" : "Patient"}: ${msg.original}`
      )
      .join("\n");

    // Use OpenAI to analyze the conversation
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a medical conversation analyzer. Your task is to analyze a conversation between a clinician and a patient and determine if it contains any of the following intents:
          
          - schedule_followup_appointment
          - send_lab_order
          
          Return a JSON object with boolean values for each intent category.`,
        },
        {
          role: "user",
          content: conversation,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse the OpenAI response
    const analysisText = response.choices[0].message.content;
    const analysis = JSON.parse(analysisText || "{}");

    // Save the analysis to Firestore
    const actionItemsRef = doc(collection(db, "actionItems"), sessionId);
    await setDoc(actionItemsRef, {
      analysis: analysis,
      createdAt: Timestamp.now(),
    });

    // Return the messages and analysis
    return NextResponse.json({
      messages,
      analysis,
    });
  } catch (error) {
    console.error("Error analyzing messages:", error);
    return NextResponse.json(
      { error: "Failed to analyze messages" },
      { status: 500 }
    );
  }
}
