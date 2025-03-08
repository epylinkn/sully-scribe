import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Create a new message
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      sessionId,
      isClinician,
      originalText,
      originalLanguage,
      translatedText,
      translatedLanguage,
    } = data;

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    if (
      originalText === undefined ||
      originalLanguage === undefined ||
      isClinician === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: originalText, originalLanguage, or isClinician",
        },
        { status: 400 }
      );
    }

    const messageData = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      is_clinician: isClinician,
      original_text: originalText,
      original_language: originalLanguage,
      translated_text: translatedText || null,
      translated_language: translatedLanguage || null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const { data: message, error } = await supabase
      .from("messages")
      .insert(messageData)
      .select("*")
      .single();

    if (error) {
      console.error("Error saving message:", error);
      return NextResponse.json(
        { error: "Failed to save message" },
        { status: 500 }
      );
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error in message API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
