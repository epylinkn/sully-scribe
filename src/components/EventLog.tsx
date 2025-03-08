import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface Event {
  type: string;
  event_id: string;
  [key: string]: any;
}

function EventItem({ event }: { event: Event }) {
  const isClient = event.event_id && !event.event_id.startsWith("event_");
  const timestamp = new Date().toLocaleTimeString();

  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${isClient ? 'text-blue-600' : 'text-gray-600'}`}>
          {isClient ? 'Client' : 'Server'}
        </span>
        <span className="text-sm text-gray-500">
          {event.type}
        </span>
        <span className="text-xs text-gray-400">
          {timestamp}
        </span>
      </div>
      <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
        {JSON.stringify(event, null, 2)}
      </pre>
    </div>
  );
}

export default function EventLog() {
  const events = useSelector((state: RootState) => state.events.events);

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No events yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {events.map((event) => (
        <EventItem key={event.event_id} event={event} />
      ))}
    </div>
  );
}
