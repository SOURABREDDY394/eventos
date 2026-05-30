import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import store from '@/data/store';
import { downloadCertificate } from '@/lib/certificate';
import { Award, Download, CheckCircle, Calendar, Loader2 } from 'lucide-react';
import type { Certificate } from '@/types';

export default function ParticipantCertificates() {
  const user = store.getCurrentUser();
  const certificates = user ? store.getUserCertificates(user.id) : [];
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const download = async (cert: Certificate) => {
    setError('');
    setBusy(cert.id);
    try {
      const event = cert.event || store.getEventById(cert.event_id);
      const organizerName = event ? store.getProfileById(event.organizer_id)?.full_name || 'EventOS' : 'EventOS';
      await downloadCertificate({
        participantName: user?.full_name || 'Participant',
        eventName: event?.title || 'Event',
        date: event?.date || new Date(cert.issued_at).toLocaleDateString(),
        organizerName,
        code: cert.certificate_code,
        role: cert.role,
      });
    } catch {
      setError('Could not generate the certificate. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <DashboardLayout title="My Certificates">
      {error && <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">{error}</div>}
      {certificates.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Award className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">No certificates yet. Certificates unlock after you’re checked in at an event and the organizer issues them.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{cert.event?.title}</h3>
                <p className="text-xs text-white/30">{cert.role}</p>
                <p className="mono-text text-[10px] text-[#E49B3A] mt-0.5 truncate">{cert.certificate_code}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-white/20" />
                  <span className="text-[10px] text-white/20">{new Date(cert.issued_at).toLocaleDateString()}</span>
                  <CheckCircle className="w-3 h-3 text-emerald-400 ml-2" />
                  <span className="text-[10px] text-emerald-400">Verified</span>
                </div>
              </div>
              <button onClick={() => download(cert)} disabled={busy === cert.id}
                className="text-[11px] px-3 py-1.5 rounded bg-[#E49B3A]/20 text-[#E49B3A] hover:bg-[#E49B3A]/30 transition-colors flex items-center gap-1 flex-shrink-0 disabled:opacity-50">
                {busy === cert.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} Download
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
