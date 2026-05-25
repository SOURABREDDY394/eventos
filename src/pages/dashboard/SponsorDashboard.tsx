import { useNavigate } from 'react-router';
import { DashboardLayout } from '@/components/DashboardLayout';
import store from '@/data/store';
import { Calendar, Handshake, CheckCircle, ArrowRight } from 'lucide-react';

export default function SponsorDashboard() {
  const navigate = useNavigate();
  const user = store.getCurrentUser();
  const stats = user ? store.getSponsorStats(user.id) : { matchingEvents: 0, submittedInterests: 0, confirmedPartnerships: 0 };
  const interests = user ? store.getSponsorInterestsBySponsor(user.id) : [];

  const statCards = [
    { icon: Calendar, label: 'Matching Events', value: stats.matchingEvents, color: 'text-blue-400' },
    { icon: Handshake, label: 'Interests Submitted', value: stats.submittedInterests, color: 'text-amber-400' },
    { icon: CheckCircle, label: 'Confirmed', value: stats.confirmedPartnerships, color: 'text-emerald-400' },
  ];

  return (
    <DashboardLayout title="Sponsor Dashboard">
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="glass-card rounded-lg p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-lg font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-white/30">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <button onClick={() => navigate('/dashboard/sponsor/events')} className="glass-card rounded-xl p-6 w-full text-left hover:border-[#E49B3A]/20 transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#E49B3A]/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-[#E49B3A]" />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-white">Browse Events</p>
            <p className="text-xs text-white/30">Find events that match your sponsorship goals</p>
          </div>
          <ArrowRight className="w-5 h-5 text-white/20" />
        </button>
      </div>

      <h2 className="text-base font-semibold text-white mb-4">My Interests</h2>
      {interests.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Handshake className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">No interests submitted yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {interests.map((si) => (
            <div key={si.id} className="glass-card rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                <Handshake className="w-5 h-5 text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{si.event?.title}</p>
                <p className="text-[10px] text-white/30">{si.package?.title || 'General Interest'}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${si.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : si.status === 'rejected' ? 'bg-red-500/20 text-red-400' : si.status === 'contacted' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>{si.status}</span>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
