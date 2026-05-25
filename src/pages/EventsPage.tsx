import { useState } from 'react';
import { Link } from 'react-router';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { EventPoster } from '@/components/EventPoster';
import store from '@/data/store';
import { eventStatusBadgeClass, getEventDisplayStatus } from '@/lib/eventLifecycle';
import { Calendar, MapPin, Users } from 'lucide-react';

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const upcomingEvents = store.getPublishedEvents();
  const pastEvents = store.getPastPublishedEvents();
  const events = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="eventos-light-app min-h-screen bg-[#F9F8F1] text-[#14150F]">
      <Navbar />
      <div className="pt-20 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="text-4xl sm:text-6xl font-black text-[#14150F] mb-2">BROWSE EVENTS</h1>
          <p className="text-sm text-[#5E6256]">Discover published events, apply with organizer forms, and wait for approval before QR tickets.</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === 'upcoming' ? 'bg-[#52670F] text-white' : 'bg-white text-[#52670F] border border-[#DDE3CA]'}`}
          >
            Upcoming ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === 'past' ? 'bg-[#52670F] text-white' : 'bg-white text-[#52670F] border border-[#DDE3CA]'}`}
          >
            Past ({pastEvents.length})
          </button>
        </div>

        {events.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-sm text-white/30">No {activeTab} events found.</p>
          </div>
        ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link key={event.id} to={`/events/${event.slug}`} className="glass-card rounded-xl overflow-hidden group hover:border-[#E49B3A]/30 transition-all">
              <div className="h-52 overflow-hidden">
                <EventPoster event={event} className="w-full h-full rounded-t-xl group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E49B3A]/10 text-[#E49B3A] font-medium">{event.category}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${eventStatusBadgeClass(getEventDisplayStatus(event))}`}>{getEventDisplayStatus(event)}</span>
                </div>
                <h3 className="text-base font-black text-[#14150F] mt-2 mb-1">{event.title}</h3>
                <div className="flex items-center gap-4 text-[11px] text-white/30">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.city}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="flex items-center gap-1 text-[11px] text-white/30">
                    <Users className="w-3 h-3" />
                    {store.getEventRegistrations(event.id).length} / {event.max_participants} registered
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
