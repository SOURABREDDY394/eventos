import { Link, useNavigate } from 'react-router';
import { ArrowRight, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AI_PROMPT_KEY = 'eventos_ai_prompt';

export default function Login() {
  const navigate = useNavigate();
  const { loginDemo, user, loading, signOut } = useAuth();

  const handleEnter = () => {
    const profile = user ?? loginDemo();
    const pendingPrompt = localStorage.getItem(AI_PROMPT_KEY);
    navigate(pendingPrompt ? '/dashboard/organizer/create-with-ai' : `/dashboard/${profile.role}`, { replace: true });
  };

  const handleReset = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-[#F9F8F1] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(213,231,161,0.75),transparent_34rem)]" />
      <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-[#EAF3D4] blur-3xl" />
      <div className="absolute -right-16 top-20 h-72 w-72 rounded-full bg-[#F7F1D9] blur-3xl" />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 items-stretch">
          <section className="rounded-[2rem] bg-white border border-[#E7E1D2] p-6 sm:p-8 shadow-[0_24px_70px_rgba(35,40,20,0.12)]">
            <Link to="/" className="inline-flex items-center gap-2 mb-9">
              <span className="w-11 h-11 rounded-full bg-[#EEF5D9] border border-[#DCE8BE] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#5C7415]" />
              </span>
              <span className="text-2xl font-black text-[#6A7D1A]">EventOS</span>
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#D8DEC4] bg-[#F8FAEF] px-4 py-2 text-sm font-bold text-[#52670F]">
              <Sparkles className="w-4 h-4" />
              One login for the whole product
            </div>

            <h1 className="mt-5 text-4xl sm:text-6xl font-black tracking-0 leading-none text-[#14150F]">
              ENTER EVENTOS
            </h1>
            <p className="mt-5 text-base leading-7 text-[#5E6256]">
              Use one demo login to access EventOS. After entering, you can open Organizer, Participant, Volunteer,
              or Sponsor workspaces from the dashboard options without logging in again.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleEnter}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#52670F] px-7 py-4 text-sm font-black text-white hover:bg-[#40510C] disabled:opacity-60 transition-colors"
              >
                {loading ? 'Opening...' : 'Continue to EventOS'}
                <ArrowRight className="w-4 h-4" />
              </button>
              {user && (
                <button
                  onClick={handleReset}
                  className="rounded-full border border-[#CBD4A9] bg-white px-7 py-4 text-sm font-black text-[#52670F] hover:bg-[#F2F6E7] transition-colors"
                >
                  Reset Login
                </button>
              )}
            </div>

            {user && (
              <p className="mt-4 text-xs text-[#6B705D]">
                Current session: <span className="font-black text-[#14150F]">{user.full_name}</span>
              </p>
            )}
          </section>

          <section className="rounded-[2rem] bg-[#10120B] text-white p-6 sm:p-8 shadow-[0_24px_70px_rgba(35,40,20,0.18)] overflow-hidden relative">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#D8F066]/20 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-black tracking-[0.22em] text-[#D8F066] uppercase">What this unlocks</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black leading-tight">One session, all EventOS workspaces.</h2>

              <div className="mt-7 grid gap-3">
                {[
                  'Create and manage events as an organizer',
                  'Browse events and apply as a participant',
                  'Track volunteer applications, tasks, hours, and proof',
                  'Explore sponsor events and submit interest',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/8 border border-white/10 p-4">
                    <CheckCircle2 className="w-5 h-5 text-[#D8F066] flex-shrink-0 mt-0.5" />
                    <p className="text-sm leading-6 text-white/76">{item}</p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-xs leading-6 text-white/45">
                No email signup, no password, no separate role login, and no SMTP setup. This is demo access for checking
                the product flows quickly.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
