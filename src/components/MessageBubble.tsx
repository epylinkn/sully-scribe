import { Message } from '@/types';

export default function MessageBubble({ message }: { message: Message }) {
  const isClinician = message.isClinician;
  
  return (
    <div className={`flex ${isClinician ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-3/4 rounded-sm p-3 ${isClinician ? 'bg-blue-100' : 'bg-green-100'}`}>
        <div className="text-sm text-gray-500 mb-1">
          {message.isClinician ? 'Clinician' : 'Patient'}
        </div>
        <div className="text-gray-800">
          {message.originalText}
        </div>
        {message.translatedText && (
          <div className="text-gray-600 mt-2 pt-2 border-t border-gray-200">
            {message.translatedText}
          </div>
        )}
      </div>
    </div>
  );
} 
