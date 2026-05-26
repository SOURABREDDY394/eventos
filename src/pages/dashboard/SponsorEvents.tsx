import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EventPoster } from '@/components/EventPoster';
import store from '@/data/store';
import { useSyncedPublishedEvents } from '@/hooks/useSyncedEvents';
import { eventStatusBadgeClass, getEventDisplayStatus } from '@/lib/eventLifecycle';
import { Calendar, MapPin, Users, Handshake, CheckCircle } from 'lucide-react';

export default function SponsorEvents() {
  const user = store.getCurrentUser();
  const events = useSyncedPublishedEvents();
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  const handleInterest = (eventId: string) => {
    if (!user) return;
    store.createSponsorInterest({
      event_id: eventId, sponsor_id: user.id, package_id: undefined,
      company_name: 'CloudTech Corp', message: 'Interested in sponsoring this event',
      status: 'new',
    });
    setSubmitted(prev => new Set([...prev, eventId]));
  };

  return (
    <DashboardLayout title="Browse Events">
      <div className="grid gap-4">
        {events.map((event) => {
          const regs = store.getEventRegistrations(event.id);
          const isSubmitted = submitted.has(event.id);
          return (
            <div key={event.id} className="glass-card rounded-xl p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <EventPoster event={event} className="w-full sm:w-32 h-24 rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E49B3A]/10 text-[#E49B3A]">{event.category}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${eventStatusBadgeClass(getEventDisplayStatus(event))}`}>{getEventDisplayStatus(event)}</span>
                      </div>
                      <h3 className="text-base font-semibold text-white mt-1">{event.title}</h3>
                    </div>
                    {isSubmitted ? (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1 flex-shrink-0"><CheckCircle className="w-3 h-3" /> Submitted</span>
                    ) : (
                      <button onClick={() => handleInterest(event.id)} className="text-[10px] px-3 py-1.5 rounded-full bg-[#E49B3A]/20 text-[#E49B3A] hover:bg-[#E49B3A]/30 transition-colors flex items-center gap-1 flex-shrink-0"><Handshake className="w-3 h-3" /> Show Interest</button>
                    )}
                  </div>
                  <p className="text-xs text-white/30 mt-1 line-clamp-2">{event.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-white/20 mt-2">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.city}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {regs.length} / {event.max_participants}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
