import { Link, useNavigate } from 'react-router';
import { ArrowRight, CheckCircle2, LockKeyhole, Shield, Sparkles } from 'lucide-react';
import { getDashboardRoute, useAuth } from '@/hooks/useAuth';

const productPoints = [
  'AI prompt-to-event builder',
  'Approval-based applications',
  'QR check-in and attendance',
  'Certificates and Proof Engine',
];

export default function Login() {
  const navigate = useNavigate();
  const { user, currentRole, loginDemo } = useAuth();

  const enterEventOS = () => {
    if (user) {
      navigate(getDashboardRoute(currentRole));
      return;
    }

    loginDemo();
    navigate('/dashboard/organizer');
  };

  return (
    <div className="eventos-light-app min-h-screen overflow-hidden bg-[radial-gradient(circle_at_82%_5%,rgba(220,233,183,0.96),transparent_30rem),radial-gradient(circle_at_0%_34%,rgba(244,196,103,0.34),transparent_25rem),linear-gradient(180deg,#FBFAF3_0%,#F6F3E8_50%,#F9F8F1_100%)] text-[#14150F]">
      <main className="mx-auto grid min-h-screen max-w-7xl items-center gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative overflow-hidden rounded-[2.4rem] border border-[#E1D8BE] bg-white/88 p-6 shadow-[0_32px_90px_rgba(82,103,15,0.14)] backdrop-blur-xl sm:p-10">
          <div className="absolute right-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-[#DCE9B7] blur-3xl" />
          <div className="relative">
            <Link to="/" className="mb-14 inline-flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#DCE8BE] bg-[#EEF5D9]">
                <Shield className="h-7 w-7 text-[#52670F]" />
              </span>
              <span className="text-3xl font-black text-[#6A7D1A]">EventOS</span>
            </Link>

            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#DCE8BE] bg-[#F4F8E8] px-4 py-2 text-[#52670F] shadow-sm">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-[0.18em]">Judge-ready access</span>
            </div>

            <h1 className="max-w-xl text-6xl font-black leading-[0.9] tracking-[-0.04em] sm:text-7xl">
              Enter EventOS.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#5E6256]">
              Use one secure demo session to access the full EventOS product. From the dashboard options, you can move between Organizer, Participant, Volunteer, and Sponsor workspaces without separate logins.
            </p>

            <button
              onClick={enterEventOS}
              className="mt-9 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#52670F] px-7 py-4 text-base font-black text-white shadow-[0_20px_45px_rgba(82,103,15,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#41520B] sm:w-auto"
            >
              {user ? 'Continue to Dashboard' : 'Continue to EventOS'}
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
              <Link to="/events" className="rounded-full border border-[#D7DDC7] bg-white px-5 py-3 text-[#52670F] hover:bg-[#F4F8E8]">
                Browse events
              </Link>
              <Link to="/proof/participant/r1" className="rounded-full border border-[#D7DDC7] bg-white px-5 py-3 text-[#52670F] hover:bg-[#F4F8E8]">
                View proof sample
              </Link>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[2.4rem] border border-[#202711]/20 bg-[#091007] p-6 text-white shadow-[0_32px_90px_rgba(18,25,10,0.22)] sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(215,255,98,0.18),transparent_22rem),radial-gradient(circle_at_82%_80%,rgba(244,196,103,0.15),transparent_24rem)]" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(215,255,98,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(215,255,98,0.25)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="relative">
            <div className="mb-10 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-2">
                <LockKeyhole className="h-4 w-4 text-[#D7FF62]" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D7FF62]">One session</span>
              </div>
              <span className="rounded-full bg-[#D7FF62] px-4 py-2 text-xs font-black text-[#14150F]">Live MVP</span>
            </div>

            <h2 className="max-w-2xl text-5xl font-black leading-[0.96] tracking-[-0.03em] sm:text-6xl">
              One login for the whole event operating system.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/62">
              This login is intentionally simple for judging: one click opens the full platform story, then Dashboard Options lets you demonstrate every role quickly.
            </p>

            <div className="mt-9 grid gap-3">
              {productPoints.map(point => (
                <div key={point} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#D7FF62]" />
                  <span className="text-sm font-bold text-white">{point}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-[1.5rem] border border-[#D7FF62]/20 bg-[#D7FF62]/8 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D7FF62]">Pitch flow</p>
              <p className="mt-3 text-sm leading-7 text-white/70">
                Login, create an event from a prompt, approve an applicant, scan QR attendance, issue certificate, and show verified proof.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
