import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EventPoster } from '@/components/EventPoster';
import store from '@/data/store';
import { Calendar, CheckCircle, HeartHandshake, MapPin, X } from 'lucide-react';
import type { Event } from '@/types';

function statusClass(status: string) {
  if (status === 'approved') return 'bg-emerald-500/20 text-emerald-400';
  if (status === 'rejected') return 'bg-red-500/20 text-red-400';
  return 'bg-amber-500/20 text-amber-400';
}

export default function VolunteerApplications() {
  const user = store.getCurrentUser();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [roleRequested, setRoleRequested] = useState('Registration Desk');
  const [skills, setSkills] = useState('');
  const [reason, setReason] = useState('');
  const [availability, setAvailability] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  const events = store.getPublishedEvents();
  const applications = user ? store.getVolunteerApplicationsByUser(user.id) : [];

  const openApply = (event: Event) => {
    setSelectedEvent(event);
    setRoleRequested('Registration Desk');
    setSkills('');
    setReason('');
    setAvailability('');
    setMessage('');
    setError('');
  };

  const submitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!user || !selectedEvent) return;

    try {
      store.createVolunteerApplication({
        event_id: selectedEvent.id,
        volunteer_id: user.id,
        role_requested: roleRequested.trim(),
        skills: skills.split(',').map(skill => skill.trim()).filter(Boolean),
        reason,
        availability,
        status: 'pending',
      });
      setSelectedEvent(null);
      setVersion(version + 1);
      setMessage('Volunteer application submitted. Waiting for organizer approval.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Volunteer application failed.');
    }
  };

  return (
    <DashboardLayout title="Volunteer Applications">
      {message && (
        <div className="mb-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {message}
        </div>
      )}
      {error && (
        <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-base font-semibold text-white mb-3">Available Events</h2>
        {events.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <HeartHandshake className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">No volunteer opportunities available yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => {
              const existing = applications.find(app => app.event_id === event.id);
              return (
                <div key={event.id} className="glass-card rounded-xl p-4 flex flex-col sm:flex-row gap-4">
                  <EventPoster event={event} className="w-full sm:w-36 h-24 rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E49B3A]/10 text-[#E49B3A]">{event.category}</span>
                    <h3 className="text-base font-semibold text-white mt-1">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-white/30 mt-2">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.venue || event.city}</span>
                      <span>{store.getProfileById(event.organizer_id)?.full_name || 'Organizer'}</span>
                    </div>
                  </div>
                  {existing ? (
                    <span className={`text-[10px] px-2 py-1 rounded-full capitalize self-start sm:self-center ${statusClass(existing.status)}`}>{existing.status}</span>
                  ) : (
                    <button onClick={() => openApply(event)} className="gold-btn text-xs self-start sm:self-center">Apply</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold text-white mb-3">My Applications</h2>
        {applications.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <HeartHandshake className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">No volunteer applications yet. Choose an event above to apply.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {applications.map((application) => {
              const event = store.getEventById(application.event_id);
              return (
                <div key={application.id} className="glass-card rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#E49B3A]/10 flex items-center justify-center flex-shrink-0">
                      <HeartHandshake className="w-5 h-5 text-[#E49B3A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{event?.title || 'Volunteer application'}</p>
                      <p className="text-xs text-white/35 mt-1">{application.role_requested}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Calendar className="w-3 h-3 text-white/20" />
                        <span className="text-[10px] text-white/25">{new Date(application.applied_at).toLocaleDateString()}</span>
                      </div>
                      {(application.skills || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {application.skills?.map(skill => <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300">{skill}</span>)}
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${statusClass(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {selectedEvent && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <form onSubmit={submitApplication} className="w-full max-w-lg glass-card rounded-xl p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-lg font-semibold text-white">Apply as Volunteer</p>
                <p className="text-xs text-white/35 mt-1">{selectedEvent.title}</p>
              </div>
              <button type="button" onClick={() => setSelectedEvent(null)} className="text-white/35 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Role requested</label>
                <input value={roleRequested} onChange={e => setRoleRequested(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#E49B3A]/50" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Skills</label>
                <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="Communication, Logistics, Design"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E49B3A]/50" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Why do you want to volunteer?</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#E49B3A]/50 resize-none" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Availability / preferred time</label>
                <input value={availability} onChange={e => setAvailability(e.target.value)} placeholder="Morning, full day, 2 PM - 6 PM"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E49B3A]/50" />
              </div>
            </div>

            <div className="pt-5 flex gap-3">
              <button type="submit" className="gold-btn text-sm">Submit Application</button>
              <button type="button" onClick={() => setSelectedEvent(null)} className="ghost-btn text-sm rounded-full">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
