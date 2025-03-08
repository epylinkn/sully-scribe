import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';

const functionDescription = `
Call this function to translate the patient's speech to English.
`;

const sessionUpdate = {
  type: "session.update",
  session: {
    tools: [
      {
        type: "function",
        name: "translate_to_english",
        description: functionDescription,
        parameters: {
          type: "object",
          strict: true,
          properties: {
            language: {
              type: "string",
              description: "The language to translate to.",
            },
            input: {
              type: "string",
              description: "The text to translate.",
            },
            output: {
              type: "string",
              description: "The translated text.",
            },
          },
          required: ["language", "input", "output"],
        },
      },
    ],
    tool_choice: "auto",
  },
};

function FunctionCallOutput({ functionCallOutput }: { functionCallOutput: any }) {
  const { language, input, output } = JSON.parse(functionCallOutput.arguments);

  return (
    <div className="flex flex-col gap-2">
      <p>Language: {language}</p>
      <p>Input: {input}</p>
      <p>Output: {output}</p>
      <pre className="text-xs bg-gray-100 rounded-md p-2 overflow-x-auto">
        {JSON.stringify(functionCallOutput, null, 2)}
      </pre>
    </div>
  );
}

export default function Thread() {
  const dispatch = useDispatch();
  const events = useSelector((state: RootState) => state.events.events);
  const isSessionActive = useSelector((state: RootState) => state.events.isSessionActive);
  const [functionAdded, setFunctionAdded] = useState(false);
  const [functionCallOutput, setFunctionCallOutput] = useState(null);

  useEffect(() => {
    if (!events || events.length === 0) return;

    const firstEvent = events[events.length - 1];
    if (!functionAdded && firstEvent.type === "session.created") {
      dispatch({ type: sessionUpdate.type, payload: sessionUpdate });
      setFunctionAdded(true);
    }

    const mostRecentEvent = events[0];
    if (
      mostRecentEvent.type === "response.done" &&
      mostRecentEvent.response?.output
    ) {
      mostRecentEvent.response.output.forEach((output: any) => {
        if (
          output.type === "function_call" &&
          output.name === "translate_to_english"
        ) {
          setFunctionCallOutput(output);
          setTimeout(() => {
            dispatch({
              type: "response.create",
              payload: {
                response: {
                  instructions: `
                  repeat the translation in the language of the patient.
                `,
                },
              },
            });
          }, 500);
        }
      });
    }
  }, [events, functionAdded, dispatch]);

  useEffect(() => {
    if (!isSessionActive) {
      setFunctionAdded(false);
      setFunctionCallOutput(null);
    }
  }, [isSessionActive]);

  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="h-full bg-gray-50 rounded-md p-4">
        <h2 className="text-lg font-bold">Thread</h2>
        {isSessionActive ? (
          functionCallOutput ? (
            <FunctionCallOutput functionCallOutput={functionCallOutput} />
          ) : (
            <p>Waiting for speech...</p>
          )
        ) : (
          <p>The session is not active.</p>
        )}
      </div>
    </section>
  );
}
