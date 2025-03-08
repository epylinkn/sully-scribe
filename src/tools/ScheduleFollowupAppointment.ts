/**
 * Simple interface for appointment data
 */
export interface AppointmentStubData {
  source: string;
}

/**
 * Schedules a followup appointment (stub implementation)
 */
export async function scheduleFollowupAppointment(data: AppointmentStubData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Create minimal payload
    const payload = {
      ...data,
      createdAt: new Date().toISOString()
    };
    
    // Make the API request
    const response = await fetch('https://webhook.site/01374a92-8cb9-46b7-95a0-31b93a9c23e7', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error in scheduleFollowupAppointment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Tool schema for AI assistant integration
export const scheduleFollowupAppointmentSchema = {
  name: "scheduleFollowupAppointment",
  description: "Schedule a followup appointment (stub)",
  parameters: {
    type: "object",
    properties: {
      source: {
        type: "string",
        description: "Source of the appointment request"
      }
    },
    required: ["source"]
  },
  // Metadata for prompt generation
  metadata: {
    category: "medical_action",
    triggerCriteria: "Mark as TRUE if either the patient or clinician explicitly states that a follow-up appointment is needed.",
    exampleTriggers: [
      "Let's schedule a follow-up visit.",
      "We should check in again in a few weeks.",
      "I need to see you again next month."
    ]
  }
}; 
