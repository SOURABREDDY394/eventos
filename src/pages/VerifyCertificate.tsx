import { Link, useParams } from 'react-router';
import { Award, Building2, Calendar, CheckCircle, Download, Shield, User, XCircle } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import store from '@/data/store';
import { downloadCertificate } from '@/lib/certificate';

export default function VerifyCertificate() {
  const params = useParams<{ certificateId?: string; id?: string }>();
  const certificateId = params.certificateId || params.id || '';
  const cert = store.getCertificateByCode(certificateId);
  const event = cert ? store.getEventById(cert.event_id) : null;
  const user = cert ? store.getProfileById(cert.user_id) : null;
  const organizer = event ? store.getProfileById(event.organizer_id) : null;

  const download = async () => {
    if (!cert || !event) return;
    await downloadCertificate({
      participantName: user?.full_name || 'Participant',
      eventName: event.title,
      date: event.date,
      organizerName: organizer?.full_name || 'EventOS',
      code: cert.certificate_code,
      role: cert.role,
    });
  };

  return (
    <div className="eventos-light-app min-h-screen bg-[#F7F6EB] text-[#14150F]">
      <Navbar />
      <main className="max-w-[76rem] mx-auto px-4 sm:px-6 pt-24 pb-16">
        <section className="passport-credential">
          <div className="passport-identity">
            <p className="passport-kicker">Certificate verification</p>
            <h1 className="text-4xl sm:text-6xl font-black tracking-[-0.055em] leading-[0.92] mt-3">
              {cert ? 'Certificate is valid.' : 'Certificate not found.'}
            </h1>
            <p className="text-lg text-[#5E6256] mt-4 max-w-2xl">
              EventOS checks the certificate ID against issued certificate records and verifies the participant, event, issue date, and organizer source.
            </p>

            <div className="rounded-2xl border border-[#DDE8BE] bg-white/70 p-4 mt-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#52670F]">Verification ID</p>
              <p className="mono-text text-lg font-black text-[#14150F] mt-2 break-all">{certificateId || 'No certificate ID provided'}</p>
            </div>

            {cert ? (
              <>
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  {[
                    { icon: User, label: 'Issued to', value: user?.full_name || 'Unknown participant' },
                    { icon: Building2, label: 'Event', value: event?.title || 'Unknown event' },
                    { icon: Calendar, label: 'Issue date', value: new Date(cert.issued_at).toLocaleDateString() },
                    { icon: Award, label: 'Role', value: cert.role },
                  ].map((item) => (
                    <div key={item.label} className="passport-rule">
                      <item.icon className="w-5 h-5" />
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-[#5E6256]">{item.label}</p>
                        <p className="font-black text-[#14150F] mt-1">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={download} className="gold-btn mt-6 inline-flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download Certificate
                </button>
              </>
            ) : (
              <div className="workspace-empty mt-8">
                <XCircle className="w-12 h-12 text-[#A4442A]/50 mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#5E6256]">
                  This ID does not match any certificate issued by EventOS in the current records.
                </p>
                <Link to="/events" className="gold-btn inline-flex mt-5">Explore events</Link>
              </div>
            )}
          </div>

          <aside className="passport-verify">
            <div className="passport-seal">
              {cert ? <CheckCircle className="w-11 h-11" /> : <Shield className="w-11 h-11" />}
              <span>{cert ? 'Valid' : 'Check'}</span>
            </div>
            <p className="passport-kicker">Verified by EventOS</p>
            <h2>{cert ? 'Authentic event credential.' : 'No valid match yet.'}</h2>
            <p>
              A valid certificate connects to an issued EventOS certificate record, an event, and a real user profile.
            </p>
            <div className="space-y-3 mt-6">
              <div className="passport-rule"><CheckCircle className="w-5 h-5" /> Certificate record: {cert ? 'Found' : 'Missing'}</div>
              <div className="passport-rule"><CheckCircle className="w-5 h-5" /> Event record: {event ? 'Found' : 'Missing'}</div>
              <div className="passport-rule"><CheckCircle className="w-5 h-5" /> Verified source: EventOS Proof Engine</div>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
