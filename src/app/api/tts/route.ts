import { NextRequest, NextResponse } from "next/server";
import { openAITTS } from "@/services/openai-tts";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Generate speech using the OpenAI TTS service
    const audioBuffer = await openAITTS.textToSpeech(text);

    // Create a response with the audio data
    const response = new NextResponse(audioBuffer);
    response.headers.set("Content-Type", "audio/mpeg");

    return response;
  } catch (error) {
    console.error("Error generating speech:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
