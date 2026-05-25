import { useParams } from 'react-router';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import store from '@/data/store';
import { Award, CheckCircle, XCircle, Shield, Calendar, User, Building } from 'lucide-react';

export default function VerifyCertificate() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const cert = store.getCertificateByCode(certificateId || '');
  const event = cert ? store.getEventById(cert.event_id) : null;
  const user = cert ? store.getProfileById(cert.user_id) : null;

  return (
    <div className="min-h-screen bg-[#030303]">
      <Navbar />
      <div className="pt-20 pb-16 max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-[#E49B3A] mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">Certificate Verification</h1>
          <p className="text-sm text-white/40 mt-1">Verify the authenticity of any EventOS certificate</p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="mb-4">
            <label className="text-xs text-white/50 mb-1.5 block">Certificate ID</label>
            <div className="mono-text text-sm bg-white/5 rounded-lg py-2.5 px-3 text-[#E49B3A]">
              {certificateId}
            </div>
          </div>

          {cert ? (
            <div className="border-t border-white/5 pt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-emerald-400">Certificate Valid</p>
                  <p className="text-xs text-white/30">This certificate is authentic and verified by EventOS</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white/[0.02] rounded-lg p-3">
                  <Award className="w-5 h-5 text-[#E49B3A]" />
                  <div>
                    <p className="text-xs text-white/30">Certificate Code</p>
                    <p className="text-sm text-white mono-text">{cert.certificate_code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/[0.02] rounded-lg p-3">
                  <User className="w-5 h-5 text-[#E49B3A]" />
                  <div>
                    <p className="text-xs text-white/30">Issued To</p>
                    <p className="text-sm text-white">{user?.full_name || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/[0.02] rounded-lg p-3">
                  <Building className="w-5 h-5 text-[#E49B3A]" />
                  <div>
                    <p className="text-xs text-white/30">Event</p>
                    <p className="text-sm text-white">{event?.title || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/[0.02] rounded-lg p-3">
                  <Calendar className="w-5 h-5 text-[#E49B3A]" />
                  <div>
                    <p className="text-xs text-white/30">Role</p>
                    <p className="text-sm text-white">{cert.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/[0.02] rounded-lg p-3">
                  <Calendar className="w-5 h-5 text-[#E49B3A]" />
                  <div>
                    <p className="text-xs text-white/30">Issued On</p>
                    <p className="text-sm text-white">{new Date(cert.issued_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-white/5 pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-lg font-semibold text-red-400">Certificate Not Found</p>
              <p className="text-sm text-white/30 mt-1">The certificate ID you entered could not be verified.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
