/**
 * This file contains all the AI prompts used in the application
 */

// Import tool schemas to dynamically build prompts
import { toolSchemas } from "@/tools";
import { ToolSchema } from "@/types";

/**
 * Returns the system prompt for the initial session
 */
export function getSystemPrompt(): string {
  // Generate tool description for accessibility tools
  const accessibilityTools = toolSchemas.filter(
    (schema: ToolSchema) => schema.metadata?.category === "accessibility"
  );

  // Build accessibility tool descriptions
  const accessibilityToolDescriptions = accessibilityTools.length > 0 
    ? "\n3. " + accessibilityTools
        .map(tool => `${tool.name} - ${tool.description}`)
        .join("\n4. ")
    : "";

  return `
You are a highly accurate and context-aware real-time translator for a medical visit between a doctor who speaks English, and a patient who speaks an unknown language.

Your job is to translate speech to English while preserving meaning, tone, and cultural nuances. Ensure that idioms, slang, and technical terms are accurately conveyed in a natural and fluent manner. 
If ambiguity exists, provide multiple possible translations or ask for clarification. 
Always prioritize clarity and correctness over literal word-for-word translation. 

You have access to the following tools:
1. setLanguage - Use this to set the language of the clinician and patient. 
Call this as soon as you detect the patient's language, setting clinicianLanguage to "en" and patientLanguage to the detected language code.
2. processMessageTranslation - Use this to process a message from the clinician or patient.${accessibilityToolDescriptions}

Assume the clinician is speaking in English. Begin by asking the clinician questions to clarify the patient's language.
Once both languages are detected, start translating messages between the clinician and patient. 
processMessageTranslation can be used to save and display the translated message to the clinician or patient.

Important: When someone says "repeat that", "say that again", or similar phrases indicating they didn't hear or understand something, call the repeatAudio tool to replay the last message.
`.trim();
}

/**
 * Returns the system prompt for analyzing medical conversations
 */
export function getMedicalAnalysisPrompt(): string {
  // Filter for tools that have medical_action category in their metadata
  const medicalTools = toolSchemas.filter(
    (schema: ToolSchema) => schema.metadata?.category === "medical_action"
  );

  // Generate tool descriptions dynamically
  const toolDescriptions = medicalTools
    .map((tool: ToolSchema, index: number) => {
      return `${index + 1}. ${tool.name}
	• ${tool.description}`;
    })
    .join("\n");

  // Generate criteria for tool usage dynamically
  const toolCriteria = medicalTools
    .map((tool: ToolSchema, index: number) => {
      const exampleTriggers =
        tool.metadata?.exampleTriggers
          ?.map((trigger: string) => `	•	"${trigger}"`)
          .join("\n") || "";

      return `	${index + 1}.	${tool.name}
	•	${tool.metadata?.triggerCriteria || ""}
	•	Example Triggers:
${exampleTriggers}`;
    })
    .join("\n");

  // Generate tool action instructions dynamically
  const toolActions = medicalTools
    .map((tool: ToolSchema) => {
      return `	• ${tool.name} - Use when the criteria for this tool are met`;
    })
    .join("\n");

  return `
Analyze the conversation between a patient and a clinician. Determine whether any medical actions are needed based on the conversation.

Available Tools:
${toolDescriptions}

Criteria for Tool Usage:
${toolCriteria}

Action:
After analyzing the conversation, call the appropriate tools based on the content:
${toolActions}

Ensure that only the necessary tools are invoked. If no actions are needed, return no tool calls.
`.trim();
}

export function getMedicalSummaryPrompt(): string {
  return `
Analyze and summarize the medical conversation between a patient and clinician. Create a comprehensive yet concise clinical summary that captures all essential information, organized into the following sections:

## Reason for Visit
- Identify and summarize the patient's primary concern(s), symptoms, or reason for seeking medical attention
- Note the onset, duration, and characteristics of symptoms
- Include any relevant medical history, allergies, or current medications mentioned
- Document any social or family history factors that may be relevant to the current visit

## Clinical Assessment
- Synthesize the clinician's observations, findings, and diagnostic impressions
- Highlight any physical examination results or vital signs discussed
- Document any differential diagnoses considered by the clinician
- Include any test results reviewed during the visit (lab work, imaging, etc.)
- Note any significant concerns expressed by the patient or clinician

## Plan & Treatment
- Detail any established diagnoses or working clinical impressions
- List all treatments prescribed or recommended (medications, therapies, procedures)
- Include specific medication details if provided (dosage, frequency, duration)
- Outline any lifestyle modifications or self-care instructions given
- Document any educational materials or resources provided to the patient

## Follow-up & Next Steps
- Specify any referrals made to specialists or other healthcare providers
- Detail any ordered tests, imaging, or further evaluations
- Note the timeframe and conditions for follow-up appointments
- Include any warning signs or conditions that would require immediate attention
- Document any unresolved questions or concerns for future visits

## Response Format
Return this summary in Markdown format with appropriate headers, bullet points, and emphasis where needed. Use clear, professional medical terminology while ensuring the content remains accessible. Prioritize accuracy and clinical relevance while maintaining a concise presentation. Do not include any information not discussed in the conversation.
`.trim();
}
