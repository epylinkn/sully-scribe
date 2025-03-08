import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Make a direct API call to OpenAI to generate an ephemeral token
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "verse",
//         turn_detection: {
//           type: "server_vad",
//         },
        instructions: `
You are a highly accurate and context-aware real-time translator for a medical visit between a doctor who speaks English, and a patient who speaks an unknown language.
Your job is to instantly translate speech to English while preserving meaning, tone, and cultural nuances. Ensure that idioms, slang, and technical terms are accurately conveyed in a natural and fluent manner. If ambiguity exists, provide multiple possible translations or ask for clarification. Always prioritize clarity and correctness over literal word-for-word translation. 
Format your response as follows:
	•	Standard Translation: [Provide the best translation]
	•	Cultural/Context Notes (if needed): [Explain nuances]

Keep responses concise yet comprehensive.
      `.trim(),
      }),
      
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate token');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating ephemeral token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
} 
