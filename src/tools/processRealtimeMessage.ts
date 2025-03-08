export const processRealtimeMessageSchema = {
  name: "processRealtimeMessage",
  description:
    "Processes a message from OpenAI's realtime API and adds it to the conversation thread",
  parameters: {
    type: "object",
    properties: {
      isClinician: {
        type: "boolean",
        description:
          "Whether the message is from the clinician (true) or patient (false)",
      },
      originalText: {
        type: "string",
        description:
          "The original content of the message from the realtime API",
      },
      originalLanguage: {
        type: "string",
        description: "The language code of the message",
        enum: [
          "en",
          "es",
          "fr",
          "de",
          "it",
          "pt",
          "ru",
          "zh",
          "ja",
          "ko",
          "ar",
          "hi",
          "bn",
          "other",
        ],
      },
      translatedText: {
        type: "string",
        description: "The translated content of the message",
      },
      translatedLanguage: {
        type: "string",
        description: "The language code of the translated message",
        enum: [
          "en",
          "es",
          "fr",
          "de",
          "it",
          "pt",
          "ru",
          "zh",
          "ja",
          "ko",
          "ar",
          "hi",
          "bn",
          "other",
        ],
      },
    },
    required: ["isClinician", "originalLanguage", "originalText"],
  },
};
