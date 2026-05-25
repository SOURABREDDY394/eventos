import { useLocation, useNavigate, useParams } from 'react-router';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EventPoster } from '@/components/EventPoster';
import store from '@/data/store';

const copy = {
  volunteers: {
    title: 'Volunteers',
    text: 'Review volunteer applications and assign event tasks.',
    path: 'volunteers',
  },
  sponsors: {
    title: 'Sponsors',
    text: 'Manage sponsor packages and incoming sponsor interest.',
    path: 'sponsors',
  },
  budget: {
    title: 'Budget',
    text: 'Track real income and expense entries per event.',
    path: 'budget',
  },
} as const;

export default function OrganizerModuleIndex() {
  const navigate = useNavigate();
  const location = useLocation();
  const { module } = useParams<{ module: keyof typeof copy }>();
  const pathModule = location.pathname.split('/').pop() as keyof typeof copy;
  const current = module && copy[module] ? copy[module] : copy[pathModule] || copy.volunteers;
  const user = store.getCurrentUser();
  const events = user ? store.getOrganizerEvents(user.id) : [];

  return (
    <DashboardLayout title={current.title}>
      <p className="text-sm text-white/40 mb-6">{current.text}</p>
      {events.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <ClipboardList className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30 mb-4">Create an event first, then manage {current.title.toLowerCase()} from the event workspace.</p>
          <button onClick={() => navigate('/dashboard/organizer/create-with-ai')} className="gold-btn text-sm">Create with AI</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map(event => (
            <button
              key={event.id}
              onClick={() => navigate(`/dashboard/organizer/events/${event.id}/${current.path}`)}
              className="glass-card rounded-xl p-4 text-left hover:border-[#E49B3A]/25 transition-all flex items-center gap-4"
            >
              <EventPoster event={event} variant="thumb" className="w-14 h-14 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{event.title}</h3>
                <p className="text-xs text-white/30">{event.date} · {event.city}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/25" />
            </button>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
