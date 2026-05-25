import { DashboardLayout } from '@/components/DashboardLayout';
import store from '@/data/store';
import { Award, Download, CheckCircle, Calendar } from 'lucide-react';

export default function ParticipantCertificates() {
  const user = store.getCurrentUser();
  const certificates = user ? store.getUserCertificates(user.id) : [];

  const downloadCert = (cert: typeof certificates[0]) => {
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
    ctx.fillText('EVENTOS CERTIFICATE', 400, 100);
    ctx.fillStyle = '#F7F7F5';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(user?.full_name || 'Participant', 400, 200);
    ctx.fillStyle = '#F7F7F580';
    ctx.font = '16px sans-serif';
    ctx.fillText(`has successfully completed`, 400, 250);
    ctx.fillStyle = '#E49B3A';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(cert.event?.title || 'Event', 400, 300);
    ctx.fillStyle = '#F7F7F550';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Role: ${cert.role}`, 400, 350);
    ctx.fillStyle = '#F7F7F550';
    ctx.font = '12px monospace';
    ctx.fillText(`Certificate ID: ${cert.certificate_code}`, 400, 400);
    ctx.fillText(`Issued: ${new Date(cert.issued_at).toLocaleDateString()}`, 400, 420);
    ctx.fillStyle = '#E49B3A80';
    ctx.font = '12px sans-serif';
    ctx.fillText('Verified by EventOS - eventos.com/verify/' + cert.certificate_code, 400, 500);
    const link = document.createElement('a');
    link.download = `certificate-${cert.certificate_code}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <DashboardLayout title="My Certificates">
      {certificates.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Award className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">No certificates yet. Attend events to earn them!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">{cert.event?.title}</h3>
                <p className="text-xs text-white/30">{cert.role}</p>
                <p className="mono-text text-[10px] text-[#E49B3A] mt-0.5">{cert.certificate_code}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-white/20" />
                  <span className="text-[10px] text-white/20">{new Date(cert.issued_at).toLocaleDateString()}</span>
                  <CheckCircle className="w-3 h-3 text-emerald-400 ml-2" />
                  <span className="text-[10px] text-emerald-400">Verified</span>
                </div>
              </div>
              <button onClick={() => downloadCert(cert)} className="text-[10px] px-3 py-1.5 rounded bg-[#E49B3A]/20 text-[#E49B3A] hover:bg-[#E49B3A]/30 transition-colors flex items-center gap-1 flex-shrink-0">
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
