/**
 * Interface for lab order data
 */
export interface LabOrderData {
  patientName: string;
  labTests?: string[];
  notes?: string;
}

/**
 * Sends a lab order to the specified endpoint
 */
export async function sendLabOrder(data: LabOrderData): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const response = await fetch('https://webhook.site/01374a92-8cb9-46b7-95a0-31b93a9c23e7', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'lab_order',
        timestamp: new Date().toISOString(),
        data: {
          patientName: data.patientName,
          labTests: data.labTests || [],
          notes: data.notes || '',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send lab order: ${response.status} ${response.statusText}`);
    }

    return {
      success: true,
      message: `Lab order successfully sent for patient: ${data.patientName}`,
    };
  } catch (error) {
    console.error('Error sending lab order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Tool schema for AI assistant integration
export const sendLabOrderSchema = {
  name: "SendLabOrderTool",
  description: "Use this tool when a lab order needs to be sent for the patient",
  parameters: {
    type: "object",
    properties: {
      patientName: {
        type: "string",
        description: "The name of the patient for whom the lab order is being sent",
      },
      labTests: {
        type: "array",
        items: {
          type: "string",
        },
        description: "List of lab tests to be ordered",
      },
      notes: {
        type: "string",
        description: "Additional notes or instructions for the lab order",
      },
    },
    required: ["patientName"],
  },
  // Metadata for prompt generation
  metadata: {
    category: "medical_action",
    triggerCriteria: "Mark as TRUE if the clinician states that a new lab order needs to be sent. Do not mark as TRUE if the conversation merely discusses lab results without explicitly mentioning that a new lab order is being sent.",
    exampleTriggers: [
      "I'll send an order for blood work.",
      "I'll place a lab request for you.",
      "Let me order a test to check your levels."
    ]
  }
}; 
