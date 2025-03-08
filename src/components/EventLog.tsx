import { RealtimeEvent } from '@/types';

function EventItem({ event }: { event: RealtimeEvent }) {
  const timestamp = new Date().toLocaleTimeString();

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-white shadow-sm border border-gray-100">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">
          {event.type}
        </span>
        <span className="text-xs text-gray-400 ml-auto">
          {timestamp}
        </span>
      </div>
      <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
        {JSON.stringify(event, null, 2)}
      </pre>
    </div>
  );
}

export default function EventLog({ events }: { events: RealtimeEvent[] }) {
  return (
    <div className="h-full bg-gray-50 rounded-lg p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Event Log</h2>
      
      {events.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-gray-500 bg-white rounded-lg border border-gray-200 p-4">
          No events yet
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event, index) => (
            <EventItem key={index} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
