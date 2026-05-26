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
    { icon: Calendar, label: 'Matching Events', value: stats.matchingEvents, tone: 'bg-[#EDF7EC] text-[#53710C]' },
    { icon: Handshake, label: 'Interests Submitted', value: stats.submittedInterests, tone: 'bg-[#FFF4DE] text-[#A06D11]' },
    { icon: CheckCircle, label: 'Confirmed', value: stats.confirmedPartnerships, tone: 'bg-[#F1FFF5] text-[#147142]' },
  ];

  return (
    <DashboardLayout title="Sponsor Dashboard">
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className={`rounded-2xl border border-black/10 p-5 shadow-sm ${s.tone}`}>
            <s.icon className="w-5 h-5 mb-3" />
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[10px] font-black tracking-wide uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <button onClick={() => navigate('/dashboard/sponsor/events')} className="rounded-[1.5rem] border border-[#E1D8BE] bg-[#FFFCF3] p-6 w-full text-left transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(82,103,15,0.12)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF5DC] flex items-center justify-center">
            <Calendar className="w-6 h-6 text-[#52670F]" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-black text-[#14150F]">Browse Events</p>
            <p className="text-sm text-[#5E6256]">Find events that match your sponsorship goals</p>
          </div>
          <ArrowRight className="w-5 h-5 text-[#52670F]" />
        </button>
      </div>

      <h2 className="text-xl font-black text-[#14150F] mb-4">My Interests</h2>
      {interests.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-[#D9D0B8] bg-[#FFFCF3] p-8 text-center">
          <Handshake className="w-12 h-12 text-[#52670F]/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#5E6256]">No interests submitted yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {interests.map((si) => (
            <div key={si.id} className="rounded-2xl border border-[#E1D8BE] bg-[#FFFCF3] p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#FFF4DE] flex items-center justify-center flex-shrink-0">
                <Handshake className="w-5 h-5 text-[#A06D11]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-[#14150F] truncate">{si.event?.title}</p>
                <p className="text-[10px] text-[#5E6256]">{si.package?.title || 'General Interest'}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${si.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : si.status === 'rejected' ? 'bg-red-500/20 text-red-400' : si.status === 'contacted' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>{si.status}</span>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
