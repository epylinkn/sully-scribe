export const addMessageSchema = {
  name: "addMessage",
  description:
    "Adds a message to the database, denoting speaker, original text, translation, and language",
  parameters: {
    type: "object",
    properties: {
      isClinician: {
        type: "boolean",
        description:
          "Whether the message is from the clinician (true) or patient (false)",
      },
      original: {
        type: "string",
        description: "The original message text",
      },
      translated: {
        type: "string",
        description: "The translated message text (if any)",
        nullable: true,
      },
      language: {
        type: "string",
        description:
          "The language code of the original message (e.g., 'en', 'es', 'fr')",
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
    required: ["isClinician", "original", "language"],
  },
};
