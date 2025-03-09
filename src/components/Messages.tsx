import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { LanguageCode } from '@/types';
import { addMessage, saveMessageToFirebase, setClinicianLanguage, setPatientLanguage } from '@/store/thread';
import MessageBubble from "./MessageBubble";
import { addMessageSchema } from "@/tools";

export default function Messages({ sendClientEvent }: { sendClientEvent: (message: any) => void }) {
  const dispatch = useDispatch();
  const events = useSelector((state: RootState) => state.events.events);
  const isSessionActive = useSelector((state: RootState) => state.thread.isSessionActive);
  const clinicianLanguage = useSelector((state: RootState) => state.thread.clinicianLanguage);
  const patientLanguage = useSelector((state: RootState) => state.thread.patientLanguage);
  const messages = useSelector((state: RootState) => state.thread.messages);
  const [functionAdded, setFunctionAdded] = useState(false);

  useEffect(() => {
    if (!events || events.length === 0) return;

    const latestEvent = events[0];
    if (latestEvent.type === "response.done" && latestEvent.response?.output) {
      latestEvent.response.output.forEach((output: any) => {
        if (output.type === "function_call") {
          switch (output.name) {
            case "setLanguage":
              const args = JSON.parse(output.arguments);
              console.log("setLanguage", args);
              dispatch(setClinicianLanguage(args.clinicianLanguage as LanguageCode));
              dispatch(setPatientLanguage(args.patientLanguage as LanguageCode));
              break;
            case "addMessage":
              const messageArgs = JSON.parse(output.arguments);
              console.log("addMessage", messageArgs);
              dispatch(addMessage(messageArgs));
              dispatch(saveMessageToFirebase(messageArgs));
              break;
          }
        }
      });
    }
  }, [events, dispatch]);

  // Change instructions when the languages are determined
  useEffect(() => {
    if (!clinicianLanguage || !patientLanguage || functionAdded) return;
    sendClientEvent({
      type: 'session.update',
      session: {
        instructions: `
The clinician will speak in '${clinicianLanguage}' and 
the patient will speak in '${patientLanguage}'. 

Your job is to instantly translate speech to so that the other person can understand it.
Ensure that idioms, slang, and technical terms are accurately conveyed in a natural and fluent manner. 
If ambiguity exists, provide multiple possible translations or ask for clarification. 
Always prioritize clarity and correctness over literal word-for-word translation. 

You have access to the following tool:
1. addMessage - Use this to add a message to the thread when it's clear that the clinician or patient has spoken.

Verbalize the translation so that the clinician or patient can understand it.
`,
        tools: [
          {
            type: "function",
            name: addMessageSchema.name,
            description: addMessageSchema.description,
            parameters: addMessageSchema.parameters,
          },
        ],
        tool_choice: "required",
      }
    });
    setFunctionAdded(true);
  }, [clinicianLanguage, patientLanguage, dispatch]);

  console.log("messages", messages);
  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="h-full bg-gray-50 rounded-md p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Messages</h2>

        {messages.length > 0 ? (
          <div className="flex flex-col">
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
          </div>
        ) : isSessionActive ? (
          <p>Waiting for speech...</p>
        ) : (
          <p>Waiting for clinician and patient language...</p>
        )}
      </div>
    </section>
  );
}
