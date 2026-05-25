import { useParams } from 'react-router';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import store from '@/data/store';
import { Shield, Calendar, Award, Users, CheckCircle, Clock, Wrench } from 'lucide-react';

export default function PassportPage() {
  const { username } = useParams<{ username: string }>();
  const profile = store.getProfileByUsername(username || '');
  const records = profile ? store.getUserPassportRecords(profile.id) : [];

  const stats = {
    events: records.filter(r => r.record_type === 'attendance').length,
    hours: records.filter(r => r.record_type === 'volunteer' || r.record_type === 'volunteer_task').reduce((s, r) => s + (r.hours || 0), 0),
    certs: records.filter(r => r.record_type === 'certificate').length,
    skills: new Set(records.flatMap(r => r.skills || [])).size,
  };
  const volunteerRecords = records.filter(r => r.record_type === 'volunteer' || r.record_type === 'volunteer_task');

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <p className="text-white/40">Passport not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303]">
      <Navbar />
      <div className="pt-20 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="glass-card rounded-2xl p-6 sm:p-8 border-glow">
          <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-20 h-20 rounded-full border-2 border-[#E49B3A] object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full border-2 border-[#E49B3A] bg-[#E49B3A]/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#E49B3A]">{profile.full_name[0]}</span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
              <p className="text-sm text-[#E49B3A]">Verified Event Passport</p>
              <p className="text-xs text-white/30 mt-1">{profile.bio}</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#E49B3A]" />
              <span className="text-xs text-white/40">EventOS</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Calendar, value: stats.events, label: 'Events Attended' },
              { icon: Clock, value: stats.hours, label: 'Volunteer Hours' },
              { icon: Award, value: stats.certs, label: 'Certificates' },
              { icon: Wrench, value: stats.skills, label: 'Skills Earned' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/[0.02] rounded-lg p-4 text-center">
                <stat.icon className="w-5 h-5 text-[#E49B3A] mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-[9px] text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>

          <div>
            {volunteerRecords.length > 0 && (
              <div className="mb-8 rounded-xl border border-[#E49B3A]/15 bg-[#E49B3A]/5 p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Volunteer Contributions</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <p className="text-lg font-bold text-[#E49B3A]">{volunteerRecords.length}</p>
                    <p className="text-[10px] text-white/35">Roles Completed</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#E49B3A]">{stats.hours}</p>
                    <p className="text-[10px] text-white/35">Hours Contributed</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#E49B3A]">{stats.skills}</p>
                    <p className="text-[10px] text-white/35">Skills Earned</p>
                  </div>
                </div>
              </div>
            )}

            <h3 className="text-sm font-semibold text-white mb-4">Records</h3>
            <div className="space-y-3">
              {records.length === 0 && (
                <p className="text-sm text-white/30 text-center py-8">No records yet</p>
              )}
              {records.map((r) => (
                <div key={r.id} className="flex items-center gap-3 bg-white/[0.02] rounded-lg p-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E49B3A]/20 to-[#E49B3A]/5 flex items-center justify-center flex-shrink-0">
                    {r.record_type === 'attendance' && <Calendar className="w-5 h-5 text-[#E49B3A]" />}
                    {r.record_type === 'certificate' && <Award className="w-5 h-5 text-[#E49B3A]" />}
                    {(r.record_type === 'volunteer' || r.record_type === 'volunteer_task') && <Users className="w-5 h-5 text-[#E49B3A]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.title}</p>
                    <p className="text-[10px] text-white/30">{r.description}</p>
                    {r.skills && r.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {r.skills.map(s => (
                          <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#E49B3A]/10 text-[#E49B3A]">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {r.hours > 0 && <span className="text-[10px] text-white/30">{r.hours}h</span>}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
