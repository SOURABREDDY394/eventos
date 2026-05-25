import { Link } from 'react-router';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EventPoster } from '@/components/EventPoster';
import store from '@/data/store';
import { getEventDisplayStatus } from '@/lib/eventLifecycle';

export default function ParticipantBrowse() {
  const events = store.getPublishedEvents();

  return (
    <DashboardLayout title="Browse Events">
      {events.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Ticket className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">No upcoming published events are available yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {events.map(event => (
            <Link key={event.id} to={`/events/${event.slug}`} className="glass-card rounded-xl overflow-hidden hover:border-[#E49B3A]/25 transition-all group">
              <EventPoster event={event} className="h-44 w-full group-hover:scale-105 transition-transform duration-300" />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E49B3A]/10 text-[#E49B3A]">{event.category}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">{getEventDisplayStatus(event)}</span>
                </div>
                <h3 className="text-base font-semibold text-white">{event.title}</h3>
                <div className="mt-3 space-y-1 text-xs text-white/35">
                  <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</p>
                  <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.venue || event.city}</p>
                </div>
                <span className="mt-4 inline-flex text-xs font-semibold text-[#E49B3A]">Apply for Event</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
