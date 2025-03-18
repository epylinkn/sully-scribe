import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  getMedicalAnalysisPrompt,
  getMedicalSummaryPrompt,
} from "@/constants/prompts";
import { sendLabOrder, sendLabOrderSchema } from "@/tools/SendLabOrder";
import {
  scheduleFollowupAppointment,
  scheduleFollowupAppointmentSchema,
} from "@/tools/ScheduleFollowupAppointment";
import { Message, Visit } from "@/types";
import { supabase } from "@/lib/supabase";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyzes a conversation for medical actions to take
 */
async function analyzeMedicalConversation(conversation: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    tools: [
      { type: "function", function: sendLabOrderSchema },
      { type: "function", function: scheduleFollowupAppointmentSchema },
    ],
    messages: [
      { role: "system", content: getMedicalAnalysisPrompt() },
      { role: "user", content: conversation },
    ],
  });

  // Process any tool calls from the response
  const toolCalls = response.choices[0].message.tool_calls;
  if (toolCalls) {
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      switch (functionName) {
        case "sendLabOrder":
          await sendLabOrder(functionArgs);
          break;
        case "scheduleFollowupAppointment":
          await scheduleFollowupAppointment(functionArgs);
          break;
      }
    }
  }

  return { toolCalls };
}

/**
 * Generates a summary of the medical conversation
 */
async function generateMedicalSummary(conversation: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: getMedicalSummaryPrompt() },
      { role: "user", content: conversation },
    ],
  });

  return response.choices[0].message.content;
}

/**
 * Converts database snake_case to TypeScript camelCase for Visit
 */
function formatVisitResponse(dbVisit: any): Visit {
  return {
    id: dbVisit.id,
    clinicianLanguage: dbVisit.clinician_language,
    patientLanguage: dbVisit.patient_language,
    summary: dbVisit.summary,
    toolCalls: dbVisit.tool_calls,
    createdAt: dbVisit.created_at,
    endedAt: dbVisit.ended_at,
    analyzedAt: dbVisit.analyzed_at,
    updatedAt: dbVisit.updated_at,
  };
}

/**
 * Fetches the full visit data from the database
 */
async function fetchVisitData(sessionId: string): Promise<any> {
  const { data, error } = await supabase
    .from("visits")
    .select("*")
    .eq("id", sessionId)
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Builds a conversation string from messages
 */
function buildConversationFromMessages(messages: Message[]): string {
  return messages
    .map((msg) => `${msg.isClinician ? "Clinician" : "Patient"}: ${msg.originalText}`)
    .join("\n");
}

/**
 * Analyze a visit
 * 1. Analyze the conversation for actions to take
 * 2. Summarize the conversation
 * 3. Store the results in the database
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Validate required configuration
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    // Get and validate session ID
    const { sessionId } = await params;
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Check if the visit has already been analyzed
    const { data: visitData, error: visitError } = await supabase
      .from("visits")
      .select("analyzed_at")
      .eq("id", sessionId)
      .single();

    if (visitError) {
      return NextResponse.json(
        { error: "Failed to fetch visit data", details: visitError.message },
        { status: 500 }
      );
    }

    // If already analyzed, return the existing visit data
    if (visitData.analyzed_at) {
      const visitData = await fetchVisitData(sessionId);
      return NextResponse.json(formatVisitResponse(visitData));
    }

    // Fetch messages for this session
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId);

    if (messagesError) {
      return NextResponse.json(
        { error: "Failed to fetch messages", details: messagesError.message },
        { status: 500 }
      );
    }

    const messages = messagesData as Message[];
    if (!messages.length) {
      return NextResponse.json(
        { error: "No messages found for this session" },
        { status: 204 }
      );
    }

    // Build conversation from messages
    const conversation = buildConversationFromMessages(messages);

    // Analyze the conversation
    const { toolCalls } = await analyzeMedicalConversation(conversation);
    
    // Generate a summary
    const summary = await generateMedicalSummary(conversation);

    // Update the visit with analysis results
    const { data: updatedVisit, error: updateError } = await supabase
      .from("visits")
      .update({
        summary,
        tool_calls: toolCalls ?? null,
        analyzed_at: new Date(),
        updated_at: new Date(),
      })
      .eq("id", sessionId)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update visit", details: updateError.message },
        { status: 500 }
      );
    }

    // Return the updated visit data
    return NextResponse.json(formatVisitResponse(updatedVisit));
  } catch (error: any) {
    console.error("Error analyzing messages:", error);
    return NextResponse.json(
      { error: "Failed to analyze messages", details: error?.message },
      { status: 500 }
    );
  }
}
