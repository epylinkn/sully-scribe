import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Create a new visit
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const sessionId = data.sessionId;
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const visit = {
      created_at: new Date(),
      updated_at: new Date(),
    };

    const { error } = await supabase
      .from("visits")
      .insert({ id: sessionId, ...visit });

    if (error) throw error;

    return NextResponse.json(visit);
  } catch (error) {
    console.error("Error creating visit:", error);
    return NextResponse.json(
      { error: "Failed to create visit" },
      { status: 500 }
    );
  }
}

// End the visit by updating the timestamp
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { clinicianLanguage, patientLanguage, sessionId } = data;

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Update only the timestamp
    await supabase
      .from("visits")
      .update({
        clinician_language: clinicianLanguage,
        patient_language: patientLanguage,
        ended_at: new Date(),
        updated_at: new Date(),
      })
      .eq("id", sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating visit:", error);
    return NextResponse.json(
      { error: "Failed to update visit" },
      { status: 500 }
    );
  }
}
