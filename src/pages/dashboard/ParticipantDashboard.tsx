import { useNavigate } from 'react-router';
import { DashboardLayout } from '@/components/DashboardLayout';
import store from '@/data/store';
import { Award, Calendar, ClipboardList, Shield, Ticket, ArrowRight } from 'lucide-react';

export default function ParticipantDashboard() {
  const navigate = useNavigate();
  const user = store.getCurrentUser();
  const stats = user ? store.getParticipantStats(user.id) : { registeredEvents: 0, upcomingEvents: 0, certificates: 0, proofRecords: 0 };

  const statCards = [
    { icon: Calendar, label: 'Registered Events', value: stats.registeredEvents, color: 'text-blue-400' },
    { icon: Calendar, label: 'Upcoming', value: stats.upcomingEvents, color: 'text-amber-400' },
    { icon: Award, label: 'Certificates', value: stats.certificates, color: 'text-emerald-400' },
    { icon: Shield, label: 'Proof Records', value: stats.proofRecords, color: 'text-purple-400' },
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
          <div key={s.label} className="glass-card rounded-lg p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-lg font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-white/30">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <button onClick={() => navigate('/dashboard/participant/browse')} className="glass-card rounded-xl p-6 text-left hover:border-[#E49B3A]/20 transition-all group">
          <Ticket className="w-8 h-8 text-[#E49B3A] mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">Browse Events</h3>
          <p className="text-xs text-white/30 mb-3">Find and register for upcoming events</p>
          <span className="text-xs text-[#E49B3A] flex items-center gap-1">Explore <ArrowRight className="w-3 h-3" /></span>
        </button>
        <button onClick={() => navigate(`/passport/${user?.username}`)} className="glass-card rounded-xl p-6 text-left hover:border-[#E49B3A]/20 transition-all group">
          <Shield className="w-8 h-8 text-[#E49B3A] mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">My Proof Passport</h3>
          <p className="text-xs text-white/30 mb-3">View your verified achievements</p>
          <span className="text-xs text-[#E49B3A] flex items-center gap-1">View <ArrowRight className="w-3 h-3" /></span>
        </button>
      </div>
    </DashboardLayout>
  );
}
