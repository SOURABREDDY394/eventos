import { useState } from 'react';
import { useParams } from 'react-router';
import { DashboardLayout } from '@/components/DashboardLayout';
import store from '@/data/store';
import { downloadCertificate } from '@/lib/certificate';
import { Award, CheckCircle, Download, Loader2 } from 'lucide-react';

export default function EventCertificates() {
  const { id } = useParams<{ id: string }>();
  const event = store.getEventById(id || '');
  const [, setVersion] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!event) return <DashboardLayout title="Certificates"><p className="text-white/40">Event not found</p></DashboardLayout>;

  const organizerName = store.getProfileById(event.organizer_id)?.full_name || store.getCurrentUser()?.full_name || 'EventOS';
  const registrations = store.getEventRegistrations(event.id);
  // Feature 2 — only checked-in (attended) participants are certificate-eligible.
  const attended = registrations.filter(r => r.status === 'attended');
  const existingCerts = store.getEventCertificates(event.id);
  const certByUser = new Map(existingCerts.map(c => [c.user_id, c]));

  const issue = (participantId: string, participantName: string) => {
    setError('');
    store.issueCertificate({
      event,
      userId: participantId,
      userName: participantName,
      role: 'Participant',
      organizerName,
    });
    store.createPassportRecord({
      user_id: participantId, event_id: event.id, record_type: 'certificate',
      title: `${event.title} Certificate`, description: 'Certificate of Participation',
      skills: [event.category], hours: 0, verified_at: new Date().toISOString(),
    });
    setVersion(v => v + 1);
  };

  const download = async (participantName: string, code: string) => {
    setError('');
    setBusy(code);
    try {
      await downloadCertificate({
        participantName,
        eventName: event.title,
        date: event.date,
        organizerName,
        code,
        role: 'Participant',
      });
    } catch {
      setError('Could not generate the certificate. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <DashboardLayout title="Certificates">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-white/40">{attended.length} checked-in · certificate eligible</p>
        <p className="text-sm text-white/40">{existingCerts.length} certificates issued</p>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">{error}</div>}

      {attended.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Award className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">No checked-in participants yet. Check participants in from the Check-In page first — only checked-in attendees can receive certificates.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attended.map((reg) => {
            const cert = certByUser.get(reg.participant_id);
            const name = reg.participant?.full_name || 'Participant';
            return (
              <div key={reg.id} className="glass-card rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-cyan-400">{name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{name}</p>
                  <p className="text-[10px] mono-text text-white/30">{cert?.certificate_code || reg.registration_code}</p>
                </div>
                {cert ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 hidden sm:flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Issued</span>
                    <button onClick={() => download(name, cert.certificate_code)} disabled={busy === cert.certificate_code}
                      className="text-[11px] px-3 py-1.5 rounded bg-[#E49B3A]/20 text-[#E49B3A] hover:bg-[#E49B3A]/30 transition-colors flex items-center gap-1 disabled:opacity-50">
                      {busy === cert.certificate_code ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} Download
                    </button>
                  </div>
                ) : (
                  <button onClick={() => issue(reg.participant_id, name)}
                    className="text-[11px] px-3 py-1.5 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors flex items-center gap-1">
                    <Award className="w-3 h-3" /> Generate
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
