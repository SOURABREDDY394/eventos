import { Ticket } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EventCard } from '@/components/EventCard';
import { useSyncedPublishedEvents } from '@/hooks/useSyncedEvents';

export default function ParticipantBrowse() {
  const events = useSyncedPublishedEvents();

  return (
    <DashboardLayout title="Browse Events">
      {events.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-[#D9D0B8] bg-[#FFFCF3] p-10 text-center shadow-sm">
          <Ticket className="w-12 h-12 text-[#52670F]/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#5E6256]">No upcoming published events are available yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {events.map(event => <EventCard key={event.id} event={event} action="Apply for Event" />)}
        </div>
      )}
    </DashboardLayout>
  );
}
