import { NextResponse } from "next/server";
import { setLanguageSchema } from "@/tools/setLanguage";
import { getSystemPrompt } from "@/constants/prompts";
import { processMessageTranslationSchema } from "@/tools/processMessageTranslation";
import { repeatAudioSchema } from "@/tools/RepeatAudio";

export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    // Make a direct API call to OpenAI to generate an ephemeral token
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "echo",
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 1000,
          },
          tools: [
            {
              type: "function",
              name: setLanguageSchema.name,
              description: setLanguageSchema.description,
              parameters: setLanguageSchema.parameters,
            },
            {
              type: "function",
              name: processMessageTranslationSchema.name,
              description: processMessageTranslationSchema.description,
              parameters: processMessageTranslationSchema.parameters,
            },
            {
              type: "function",
              name: repeatAudioSchema.name,
              description: repeatAudioSchema.description,
              parameters: repeatAudioSchema.parameters,
            },
          ],
          tool_choice: "auto",
          instructions: getSystemPrompt(),
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate token");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating ephemeral token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
