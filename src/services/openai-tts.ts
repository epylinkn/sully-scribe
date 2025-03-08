import OpenAI from "openai";

// Define the options for the TTS request
export interface TTSOptions {
  voice: "echo";
  model: "tts-1" | "tts-1-hd";
  responseFormat: "mp3";
  speed: number;
}

// Default options for TTS requests
const DEFAULT_TTS_OPTIONS: TTSOptions = {
  voice: "echo",
  model: "tts-1",
  responseFormat: "mp3",
  speed: 1.0,
};

/**
 * OpenAI Text-to-Speech Service
 *
 * This service encapsulates the OpenAI TTS API functionality,
 * providing methods to convert text to speech.
 */
export class OpenAITTSService {
  private client: OpenAI;

  /**
   * Creates a new instance of the OpenAI TTS service
   * @param apiKey Optional API key. If not provided, uses the OPENAI_API_KEY from environment variables
   */
  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Converts text to speech using OpenAI's TTS API
   *
   * @param text The text to convert to speech
   * @param options Options for the TTS request
   * @returns A Promise that resolves to an ArrayBuffer containing the audio data
   */
  async textToSpeech(
    text: string,
    options?: Partial<TTSOptions>
  ): Promise<ArrayBuffer> {
    if (!text || text.trim() === "") {
      throw new Error("Text cannot be empty");
    }

    const mergedOptions = { ...DEFAULT_TTS_OPTIONS, ...options };

    try {
      const response = await this.client.audio.speech.create({
        input: text,
        voice: mergedOptions.voice,
        model: mergedOptions.model,
        response_format: mergedOptions.responseFormat as any,
        speed: mergedOptions.speed,
      });

      // Convert the response to an ArrayBuffer
      const buffer = await response.arrayBuffer();
      return buffer;
    } catch (error) {
      console.error("Error generating speech:", error);
      throw error;
    }
  }
}

// Export a singleton instance for convenience
export const openAITTS = new OpenAITTSService();

// Default export for the service
export default OpenAITTSService;
