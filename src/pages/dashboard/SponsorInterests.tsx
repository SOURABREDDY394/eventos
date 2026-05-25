import { Link } from 'react-router';
import { DashboardLayout } from '@/components/DashboardLayout';
import store from '@/data/store';
import { Calendar, Handshake } from 'lucide-react';

export default function SponsorInterests() {
  const user = store.getCurrentUser();
  const interests = user ? store.getSponsorInterestsBySponsor(user.id) : [];

  return (
    <DashboardLayout title="My Sponsor Interests">
      {interests.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Handshake className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30 mb-4">No sponsor interests submitted yet.</p>
          <Link to="/dashboard/sponsor/events" className="gold-btn inline-flex text-sm">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {interests.map((interest) => (
            <div key={interest.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E49B3A]/10 flex items-center justify-center flex-shrink-0">
                <Handshake className="w-5 h-5 text-[#E49B3A]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{interest.event?.title || 'Sponsor interest'}</p>
                <p className="text-xs text-white/35">{interest.package?.title || 'General Interest'}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-white/20" />
                  <span className="text-[10px] text-white/25">{new Date(interest.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                interest.status === 'confirmed'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : interest.status === 'rejected'
                    ? 'bg-red-500/20 text-red-400'
                    : interest.status === 'contacted'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-amber-500/20 text-amber-400'
              }`}>
                {interest.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
