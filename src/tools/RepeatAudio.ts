/**
 * Tool for repeating the last played audio message
 * This is used when a patient or clinician asks to repeat the last message
 */

export function repeatAudio(): { 
  success: boolean;
  message: string;
} {
  console.log('Repeat audio tool called');
  
  return {
    success: true,
    message: "Repeating the last audio message"
  };
}

// Tool schema for AI assistant integration
export const repeatAudioSchema = {
  name: "repeatAudio",
  description: "Repeats the last audio message that was played to the user",
  parameters: {
    type: "object",
    properties: {},
    required: []
  },
  // Metadata for prompt generation
  metadata: {
    category: "accessibility",
    triggerCriteria: "Mark as TRUE if either the patient or clinician explicitly asks to repeat the last message or says they didn't hear something clearly.",
    exampleTriggers: [
      "Repeat that please",
      "Can you say that again?",
      "I didn't hear that",
      "Please repeat what you just said",
      "Could you repeat that?",
      "Say that again"
    ]
  }
}; 
