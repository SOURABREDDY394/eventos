import { useState } from 'react';
import { useParams } from 'react-router';
import { DashboardLayout } from '@/components/DashboardLayout';
import store from '@/data/store';
import { isPastEvent } from '@/lib/eventLifecycle';
import { QrCode, CheckCircle, AlertCircle } from 'lucide-react';

export default function EventAttendance() {
  const { id } = useParams<{ id: string }>();
  const event = store.getEventById(id || '');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!event) return <DashboardLayout title="Attendance"><p className="text-white/40">Event not found</p></DashboardLayout>;

  const registrations = store.getEventRegistrations(event.id);
  const attended = registrations.filter(r => r.status === 'attended');
  const approved = registrations.filter(r => r.status === 'approved');
  const attendanceClosed = isPastEvent(event.date);

  const handleVerify = () => {
    setMessage(null);
    if (attendanceClosed) {
      setMessage({ text: 'Attendance marking is closed for this event.', type: 'error' });
      return;
    }
    const reg = store.getRegistrationByCode(code.toUpperCase());
    if (!reg) { setMessage({ text: 'Invalid registration code', type: 'error' }); return; }
    if (reg.event_id !== event.id) { setMessage({ text: 'Code belongs to a different event', type: 'error' }); return; }
    if (reg.status === 'pending') { setMessage({ text: 'This registration is still pending approval.', type: 'error' }); return; }
    if (reg.status === 'rejected') { setMessage({ text: 'This registration was rejected.', type: 'error' }); return; }
    if (reg.status === 'attended') { setMessage({ text: 'Already checked in', type: 'error' }); return; }
    if (reg.status !== 'approved') { setMessage({ text: 'Only approved registrations can be checked in.', type: 'error' }); return; }

    store.updateRegistration(reg.id, { status: 'attended' });
    store.createAttendance({
      event_id: event.id,
      registration_id: reg.id,
      participant_id: reg.participant_id,
      checked_in_by: store.getCurrentUser()?.id,
      status: 'present',
    });
    store.createPassportRecord({
      user_id: reg.participant_id,
      event_id: event.id,
      record_type: 'attendance',
      title: event.title,
      description: `Attended as Participant`,
      skills: [event.category],
      hours: 0,
      verified_at: new Date().toISOString(),
    });
    setMessage({ text: `Checked in: ${reg.registration_code}`, type: 'success' });
    setCode('');
  };

  return (
    <DashboardLayout title="Attendance Verification">
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="glass-card rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <QrCode className="w-6 h-6 text-[#E49B3A]" />
              <h2 className="text-base font-semibold text-white">Scan or Enter Code</h2>
            </div>
            <input
              value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              disabled={attendanceClosed}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-lg text-white mono-text placeholder:text-white/20 focus:outline-none focus:border-[#E49B3A]/50 mb-3"
              placeholder="EVOS-XXXXXX" />
            <button onClick={handleVerify} disabled={attendanceClosed} className="w-full gold-btn disabled:opacity-50">Verify & Check In</button>
            {attendanceClosed && <p className="text-xs text-white/35 mt-3">Attendance marking is closed for this event.</p>}
            {message && (
              <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="text-sm">{message.text}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card rounded-lg p-4 text-center">
              <p className="text-xl font-bold text-white">{registrations.length}</p>
              <p className="text-[10px] text-white/30">Total</p>
            </div>
            <div className="glass-card rounded-lg p-4 text-center">
              <p className="text-xl font-bold text-emerald-400">{attended.length}</p>
              <p className="text-[10px] text-white/30">Checked In</p>
            </div>
            <div className="glass-card rounded-lg p-4 text-center">
              <p className="text-xl font-bold text-blue-400">{approved.length}</p>
              <p className="text-[10px] text-white/30">Approved</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Checked-in Attendees</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {attended.length === 0 && <p className="text-sm text-white/30 text-center py-8">No check-ins yet</p>}
            {attended.map((reg) => (
              <div key={reg.id} className="glass-card rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{reg.participant?.full_name || 'Unknown'}</p>
                  <p className="text-[10px] mono-text text-white/30">{reg.registration_code}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
