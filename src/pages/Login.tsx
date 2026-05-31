import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, CheckCircle2, LockKeyhole, Shield, UserRound } from 'lucide-react';
import { getDashboardRoute, useAuth } from '@/hooks/useAuth';

const productPoints = [
  'One identity for every workspace',
  'Saved browser session for demo use',
  'Organizer, Participant, Volunteer, Sponsor access',
  'Events, QR, certificates, and proof flows stay connected',
];

function cleanUsername(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 28);
}

export default function Login() {
  const navigate = useNavigate();
  const { user, currentRole, loginDemo } = useAuth();
  const [name, setName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');

  const previewUsername = useMemo(() => cleanUsername(username || name.replace(/\s+/g, '')), [name, username]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const fullName = name.trim();
    const finalUsername = cleanUsername(username || name.replace(/\s+/g, ''));

    if (!fullName) {
      setError('Enter your name so EventOS can show who is using the demo.');
      return;
    }
    if (!finalUsername) {
      setError('Enter a username using letters or numbers.');
      return;
    }

    loginDemo({ name: fullName, username: finalUsername, email });
    navigate('/dashboard/organizer');
  };

  const continueExisting = () => {
    navigate(getDashboardRoute(currentRole || 'organizer'));
  };

  return (
    <div className="eventos-light-app min-h-screen overflow-hidden bg-[radial-gradient(circle_at_82%_5%,rgba(220,233,183,0.96),transparent_30rem),radial-gradient(circle_at_0%_34%,rgba(244,196,103,0.34),transparent_25rem),linear-gradient(180deg,#FBFAF3_0%,#F6F3E8_50%,#F9F8F1_100%)] text-[#14150F]">
      <main className="mx-auto grid min-h-screen max-w-7xl items-center gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.96fr_1.04fr]">
        <section className="relative overflow-hidden rounded-[2.4rem] border border-[#E1D8BE] bg-white/90 p-6 shadow-[0_32px_90px_rgba(82,103,15,0.14)] backdrop-blur-xl sm:p-10">
          <div className="absolute right-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-[#DCE9B7] blur-3xl" />
          <div className="relative">
            <Link to="/" className="mb-10 inline-flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#DCE8BE] bg-[#EEF5D9]">
                <Shield className="h-7 w-7 text-[#52670F]" />
              </span>
              <span className="text-3xl font-black text-[#6A7D1A]">EventOS</span>
            </Link>

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#DCE8BE] bg-[#F4F8E8] px-4 py-2 text-[#52670F] shadow-sm">
              <UserRound className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-[0.18em]">Demo login</span>
            </div>

            <h1 className="max-w-xl text-5xl font-black leading-[0.94] tracking-[-0.04em] sm:text-6xl">
              Login once. Use every EventOS workspace.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#5E6256]">
              This is a lightweight demo login, not full password authentication. It saves one user identity in the browser so judges can recognize who is using the app while you move across all roles.
            </p>

            {user && (
              <button
                onClick={continueExisting}
                className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#DCE8BE] bg-[#EEF5D9] px-6 py-3 text-sm font-black text-[#52670F] transition-all hover:bg-[#E5F0CB] sm:w-auto"
              >
                Continue as {user.full_name}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-[#7B845D]">Full name</span>
                <input
                  value={name}
                  onChange={event => setName(event.target.value)}
                  placeholder="Sourab Reddy"
                  className="w-full rounded-2xl border border-[#E1D8BE] bg-[#F7F6EB] px-4 py-3 text-base font-semibold text-[#14150F] placeholder:text-[#9AA08D] focus:border-[#52670F]/50 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-[#7B845D]">Username</span>
                <input
                  value={username}
                  onChange={event => setUsername(cleanUsername(event.target.value))}
                  placeholder="sourab"
                  className="w-full rounded-2xl border border-[#E1D8BE] bg-[#F7F6EB] px-4 py-3 text-base font-semibold text-[#14150F] placeholder:text-[#9AA08D] focus:border-[#52670F]/50 focus:outline-none"
                />
                <p className="mt-2 text-xs font-semibold text-[#6B705D]">Proof pages and saved demo records use: @{previewUsername || 'username'}</p>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-[#7B845D]">Email optional</span>
                <input
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-[#E1D8BE] bg-[#F7F6EB] px-4 py-3 text-base font-semibold text-[#14150F] placeholder:text-[#9AA08D] focus:border-[#52670F]/50 focus:outline-none"
                />
              </label>

              {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

              <button className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#52670F] px-7 py-4 text-base font-black text-white shadow-[0_20px_45px_rgba(82,103,15,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#41520B]">
                Login to EventOS
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[2.4rem] border border-[#202711]/20 bg-[#091007] p-6 text-white shadow-[0_32px_90px_rgba(18,25,10,0.22)] sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(215,255,98,0.18),transparent_22rem),radial-gradient(circle_at_82%_80%,rgba(244,196,103,0.15),transparent_24rem)]" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(215,255,98,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(215,255,98,0.25)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="relative">
            <div className="mb-10 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-2">
                <LockKeyhole className="h-4 w-4 text-[#D7FF62]" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D7FF62]">One identity</span>
              </div>
              <span className="rounded-full bg-[#D7FF62] px-4 py-2 text-xs font-black text-[#14150F]">Demo MVP</span>
            </div>

            <h2 className="max-w-2xl text-5xl font-black leading-[0.96] tracking-[-0.03em] sm:text-6xl">
              Your name follows the full event lifecycle.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/62">
              Login creates a reusable demo profile. After that, Dashboard Options lets the same person act as organizer, participant, volunteer, or sponsor for judging the flow.
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
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D7FF62]">What to tell judges</p>
              <p className="mt-3 text-sm leading-7 text-white/70">
                This is not production auth yet. It is a demo identity layer so the product can recognize the user, save their session, and keep event operations moving during the pitch.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
