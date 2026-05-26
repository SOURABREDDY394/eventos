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
      <p className="text-sm text-[#5E6256] mb-6">{current.text}</p>
      {events.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-[#D9D0B8] bg-[#FFFCF3] p-8 text-center shadow-sm">
          <ClipboardList className="w-12 h-12 text-[#52670F]/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#5E6256] mb-4">Create an event first, then manage {current.title.toLowerCase()} from the event workspace.</p>
          <button onClick={() => navigate('/dashboard/organizer/create-with-ai')} className="gold-btn text-sm">Create with AI</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map(event => (
            <button
              key={event.id}
              onClick={() => navigate(`/dashboard/organizer/events/${event.id}/${current.path}`)}
              className="rounded-[1.5rem] border border-[#E1D8BE] bg-[#FFFCF3] p-4 text-left transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(82,103,15,0.12)] flex items-center gap-4"
            >
              <EventPoster event={event} variant="thumb" className="w-14 h-14 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-[#14150F] truncate">{event.title}</h3>
                <p className="text-xs text-[#5E6256]">{event.date} · {event.city}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#52670F]" />
            </button>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
