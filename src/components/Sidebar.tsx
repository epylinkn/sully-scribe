import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { LANGUAGE_FLAGS, LANGUAGE_NAMES } from "@/constants/languages";

export default function Sidebar({ sessionId }: { sessionId: string }) {
  const clinicianLanguage = useSelector((state: RootState) => state.thread.clinicianLanguage);
  const patientLanguage = useSelector((state: RootState) => state.thread.patientLanguage);

  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="h-full bg-gray-50 rounded-md p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Session Info</h2>
        
        <div className="mb-4 p-2 bg-gray-100 border border-gray-200 rounded-md">
          <p className="text-sm text-gray-600">
            Session ID:&nbsp;
            <span className="font-mono text-gray-800">{sessionId || '-'}</span>
          </p>
        </div>

        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Clinician language:&nbsp;
            {clinicianLanguage && (
              <span className="font-semibold">{LANGUAGE_NAMES[clinicianLanguage]} {LANGUAGE_FLAGS[clinicianLanguage]}</span>
            )}
          </p>
        </div>

        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Patient language:&nbsp;
            {patientLanguage && (
              <span className="font-semibold">{LANGUAGE_NAMES[patientLanguage]} {LANGUAGE_FLAGS[patientLanguage]}</span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
} 
