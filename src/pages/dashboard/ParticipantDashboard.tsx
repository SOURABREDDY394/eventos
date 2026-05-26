import { useNavigate } from 'react-router';
import { DashboardLayout } from '@/components/DashboardLayout';
import store from '@/data/store';
import { Award, Calendar, ClipboardList, Shield, Ticket, ArrowRight } from 'lucide-react';

export default function ParticipantDashboard() {
  const navigate = useNavigate();
  const user = store.getCurrentUser();
  const stats = user ? store.getParticipantStats(user.id) : { registeredEvents: 0, upcomingEvents: 0, certificates: 0, proofRecords: 0 };

  const statCards = [
    { icon: Calendar, label: 'Registered Events', value: stats.registeredEvents, tone: 'bg-[#EDF7EC] text-[#53710C]' },
    { icon: Calendar, label: 'Upcoming', value: stats.upcomingEvents, tone: 'bg-[#F7F7D9] text-[#5D6710]' },
    { icon: Award, label: 'Certificates', value: stats.certificates, tone: 'bg-[#FFF4DE] text-[#A06D11]' },
    { icon: Shield, label: 'Proof Records', value: stats.proofRecords, tone: 'bg-[#EAF1FF] text-[#315B92]' },
  ];

  const workspaceOptions = [
    { icon: Ticket, title: 'Browse Events', text: 'Find upcoming events and apply.', path: '/dashboard/participant/browse' },
    { icon: ClipboardList, title: 'My Applications', text: 'Track pending, approved, and rejected applications.', path: '/dashboard/participant/applications' },
    { icon: Ticket, title: 'My Tickets', text: 'View QR tickets after organizer approval.', path: '/dashboard/participant/tickets' },
    { icon: Award, title: 'Certificates', text: 'View certificates issued after attendance.', path: '/dashboard/participant/certificates' },
    { icon: Shield, title: 'Proof Passport', text: 'Open your public verified proof.', path: `/passport/${user?.username}` },
  ];

  return (
    <DashboardLayout title="Participant Dashboard">
      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {workspaceOptions.map((option) => (
          <button key={option.path} onClick={() => navigate(option.path)} className="goavo-card-effect glass-card rounded-3xl p-5 text-left">
            <option.icon className="w-6 h-6 text-[#52670F] mb-4" />
            <h3 className="text-base font-black text-[#14150F]">{option.title}</h3>
            <p className="text-xs text-[#5E6256] leading-5 mt-2">{option.text}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className={`rounded-2xl border border-black/10 p-5 shadow-sm ${s.tone}`}>
            <s.icon className="w-5 h-5 mb-3" />
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[10px] font-black tracking-wide uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <button onClick={() => navigate('/dashboard/participant/browse')} className="rounded-[1.5rem] border border-[#E1D8BE] bg-[#FFFCF3] p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(82,103,15,0.12)] group">
          <Ticket className="w-8 h-8 text-[#52670F] mb-3" />
          <h3 className="text-lg font-black text-[#14150F] mb-1">Browse Events</h3>
          <p className="text-sm text-[#5E6256] mb-3">Find and register for upcoming events</p>
          <span className="text-xs font-black text-[#52670F] flex items-center gap-1">Explore <ArrowRight className="w-3 h-3" /></span>
        </button>
        <button onClick={() => navigate(`/passport/${user?.username}`)} className="rounded-[1.5rem] border border-[#E1D8BE] bg-[#FFFCF3] p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(82,103,15,0.12)] group">
          <Shield className="w-8 h-8 text-[#52670F] mb-3" />
          <h3 className="text-lg font-black text-[#14150F] mb-1">My Proof Passport</h3>
          <p className="text-sm text-[#5E6256] mb-3">View your verified achievements</p>
          <span className="text-xs font-black text-[#52670F] flex items-center gap-1">View <ArrowRight className="w-3 h-3" /></span>
        </button>
      </div>
    </DashboardLayout>
  );
}
