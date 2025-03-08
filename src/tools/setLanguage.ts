import { LanguageCode } from '@/types';

export function setLanguage(
  clinicianLanguage: LanguageCode = 'en',
  patientLanguage: LanguageCode
): {
  clinicianLanguage: LanguageCode;
  patientLanguage: LanguageCode;
} {
  console.log(`Setting language: Clinician=${clinicianLanguage}, Patient=${patientLanguage}`);
  
  return {
    clinicianLanguage,
    patientLanguage
  };
}

// JSON Schema for the setLanguage function
export const setLanguageSchema = {
  name: "setLanguage",
  description: "Sets the language of the conversation for the clinician and patient",
  parameters: {
    type: "object",
    properties: {
      clinicianLanguage: {
        type: "string",
        description: "The language code for the clinician (e.g., 'en', 'es', 'fr')",
        enum: ["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko", "ar", "hi", "bn", "other"]
      },
      patientLanguage: {
        type: "string",
        description: "The language code for the patient (e.g., 'en', 'es', 'fr')",
        enum: ["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko", "ar", "hi", "bn", "other"]
      }
    },
    required: ["clinicianLanguage", "patientLanguage"]
  }
}; 
