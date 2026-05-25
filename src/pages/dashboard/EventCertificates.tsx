import { useState } from 'react';
import { useParams } from 'react-router';
import { DashboardLayout } from '@/components/DashboardLayout';
import store from '@/data/store';
import { Award, CheckCircle, Download } from 'lucide-react';

export default function EventCertificates() {
  const { id } = useParams<{ id: string }>();
  const event = store.getEventById(id || '');
  if (!event) return <DashboardLayout title="Certificates"><p className="text-white/40">Event not found</p></DashboardLayout>;

  const registrations = store.getEventRegistrations(event.id);
  const attended = registrations.filter(r => r.status === 'attended');
  const existingCerts = store.getEventCertificates(event.id);
  const [issuedIds, setIssuedIds] = useState<Set<string>>(new Set(existingCerts.map(c => c.user_id)));

  const issueCertificate = (participantId: string, _participantName: string) => {
    const code = `CERT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    store.createCertificate({
      event_id: event.id, user_id: participantId, certificate_code: code, role: 'Participant',
    });
    store.createPassportRecord({
      user_id: participantId, event_id: event.id, record_type: 'certificate',
      title: `${event.title} Certificate`, description: `Certificate of Participation`,
      skills: [event.category], hours: 0, certificate_id: code, verified_at: new Date().toISOString(),
    });
    setIssuedIds(prev => new Set([...prev, participantId]));
  };

  const downloadCert = (participantName: string, code: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#030303';
    ctx.fillRect(0, 0, 800, 600);
    ctx.strokeStyle = '#E49B3A';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 760, 560);
    ctx.strokeStyle = '#E49B3A40';
    ctx.lineWidth = 1;
    ctx.strokeRect(35, 35, 730, 530);
    ctx.fillStyle = '#E49B3A';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EVENTOS CERTIFICATE OF PARTICIPATION', 400, 100);
    ctx.fillStyle = '#F7F7F5';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(participantName, 400, 200);
    ctx.fillStyle = '#F7F7F580';
    ctx.font = '16px sans-serif';
    ctx.fillText(`has successfully participated in`, 400, 250);
    ctx.fillStyle = '#E49B3A';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(event.title, 400, 300);
    ctx.fillStyle = '#F7F7F550';
    ctx.font = '12px monospace';
    ctx.fillText(`Certificate ID: ${code}`, 400, 400);
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 400, 420);
    ctx.fillStyle = '#E49B3A80';
    ctx.font = '12px sans-serif';
    ctx.fillText('Verified by EventOS', 400, 500);
    const link = document.createElement('a');
    link.download = `certificate-${code}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <DashboardLayout title="Certificates">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-white/40">{attended.length} eligible participants</p>
        <p className="text-sm text-white/40">{existingCerts.length} certificates issued</p>
      </div>

      {attended.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center"><p className="text-sm text-white/30">No attended participants yet. Verify attendance first.</p></div>
      ) : (
        <div className="space-y-2">
          {attended.map((reg) => {
            const isIssued = issuedIds.has(reg.participant_id);
            const cert = existingCerts.find(c => c.user_id === reg.participant_id);
            return (
              <div key={reg.id} className="glass-card rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-cyan-400">{reg.participant?.full_name?.[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{reg.participant?.full_name}</p>
                  <p className="text-[10px] mono-text text-white/30">{reg.registration_code}</p>
                </div>
                {isIssued || cert ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Issued</span>
                    <button onClick={() => downloadCert(reg.participant?.full_name || 'User', cert?.certificate_code || '')} className="text-[10px] px-2 py-1 rounded bg-[#E49B3A]/20 text-[#E49B3A] flex items-center gap-1"><Download className="w-3 h-3" /> Download</button>
                  </div>
                ) : (
                  <button onClick={() => issueCertificate(reg.participant_id, reg.participant?.full_name || '')} className="text-[10px] px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors flex items-center gap-1"><Award className="w-3 h-3" /> Issue</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
