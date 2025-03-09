import { NextResponse } from "next/server";
import { setLanguageSchema } from "@/tools/setLanguage";

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
          voice: "verse",
          turn_detection: {
            type: "server_vad",
          },
          tools: [
            {
              type: "function",
              name: setLanguageSchema.name,
              description: setLanguageSchema.description,
              parameters: setLanguageSchema.parameters,
            },
          ],
          tool_choice: "auto",
          instructions: `
You are a highly accurate and context-aware real-time translator for a medical visit between a doctor who speaks English, and a patient who speaks an unknown language.

Your job is to instantly translate speech to English while preserving meaning, tone, and cultural nuances. Ensure that idioms, slang, and technical terms are accurately conveyed in a natural and fluent manner. If ambiguity exists, provide multiple possible translations or ask for clarification. Always prioritize clarity and correctness over literal word-for-word translation. 

You have access to the following tool:
1. setLanguage - Use this to set the languages for both the clinician and patient. Call this as soon as you detect the patient's language, setting clinicianLanguage to "en" and patientLanguage to the detected language code.

Keep responses concise yet comprehensive.
      `.trim(),
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
