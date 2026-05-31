import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowRight, LogOut, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ensureSupabaseSession } from '@/lib/persistence';
import store from '@/data/store';
import type { UserRole } from '@/types';

function isDashboardRole(role: string | undefined): role is UserRole {
  return role === 'organizer' || role === 'participant' || role === 'volunteer' || role === 'sponsor';
}

export function DashboardLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, continueAs, signOut } = useAuth();
  const [error, setError] = useState('');

  // Best-effort: open a real Supabase session and hydrate the new-feature
  // tables. Both swallow failures so the demo always works offline.
  useEffect(() => {
    let active = true;
    ensureSupabaseSession().then(() => {
      if (active) store.hydrateEtrack().catch(() => {});
    });
    return () => { active = false; };
  }, []);

  const [dashboardSegment, routeRole] = location.pathname.split('/').slice(1, 3);
  const workspaceRole = dashboardSegment === 'dashboard' && isDashboardRole(routeRole) ? routeRole : user?.role;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      if (dashboardSegment === 'dashboard' && isDashboardRole(routeRole)) {
        continueAs(routeRole);
        return;
      }
      navigate('/', { replace: true });
      return;
    }

    if (dashboardSegment === 'dashboard' && isDashboardRole(routeRole) && routeRole !== user.role) {
      continueAs(routeRole);
    }
  }, [continueAs, dashboardSegment, loading, navigate, routeRole, user]);

  const handleSignOut = async () => {
    setError('');
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F1] flex items-center justify-center">
        <p className="text-sm text-[#5E6256]">Opening EventOS workspace...</p>
      </div>
    );
  }

  if (!user) return null;

  const initial = user.full_name?.[0] || user.username?.[0] || '?';
  const workspaceCopy = {
    organizer: 'Create events, approve people, coordinate teams, and turn attendance into verified proof.',
    participant: 'Browse events, track applications, unlock QR tickets, and collect verified proof.',
    volunteer: 'Apply for roles, complete assigned tasks, earn hours, and build public proof.',
    sponsor: 'Discover events, submit interest, and manage sponsor conversations.',
  }[workspaceRole || 'organizer'];

  return (
    <div className="eventos-light-app dashboard-premium-shell min-h-screen bg-[radial-gradient(circle_at_78%_0%,rgba(220,233,183,0.95),transparent_30rem),radial-gradient(circle_at_6%_32%,rgba(244,216,149,0.38),transparent_24rem),linear-gradient(180deg,#FBFAF3_0%,#F6F3E8_48%,#F9F8F1_100%)] text-[#14150F]">
      <main className="max-w-[92rem] mx-auto px-4 sm:px-6 py-5 sm:py-7">
        <div className="dashboard-premium-nav mb-6 rounded-[1.75rem] sm:rounded-full bg-white/92 backdrop-blur-xl border border-[#E4E0D4] shadow-[0_10px_30px_rgba(35,40,20,0.08)] px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-full bg-[#EEF5D9] border border-[#DCE8BE] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#5C7415]" />
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#6A7D1A]">EventOS</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="hidden sm:inline-flex rounded-full border border-[#DDE3CA] px-4 py-2 text-sm font-bold text-[#52670F] hover:bg-[#F2F6E7]"
            >
              Dashboard Options
            </button>
            <div className="hidden md:flex items-center gap-2 rounded-full bg-[#F7F6EB] border border-[#E7E1D2] px-3 py-2">
              <span className="w-7 h-7 rounded-full bg-[#EEF5D9] flex items-center justify-center text-xs font-black text-[#52670F]">{initial}</span>
              <div className="leading-tight">
                <p className="text-xs font-black text-[#14150F]">{user.full_name}</p>
                <p className="text-[10px] text-[#6B705D] capitalize">{workspaceRole}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-10 h-10 rounded-full border border-[#E7E1D2] bg-white text-[#6B705D] hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center"
              aria-label="Switch role"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <section className="dashboard-premium-hero relative overflow-hidden rounded-[2rem] bg-[#F6FAE8] border border-[#DDE8BE] px-5 py-6 sm:px-8 sm:py-8 shadow-[0_28px_80px_rgba(82,103,15,0.14)] mb-6 text-[#14150F]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_12%,rgba(216,240,102,0.55),transparent_24rem),radial-gradient(circle_at_10%_92%,rgba(244,196,103,0.18),transparent_20rem),linear-gradient(135deg,rgba(255,255,255,0.84),rgba(236,246,214,0.54))]" />
          <div className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(rgba(82,103,15,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(82,103,15,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#9DBB44] to-transparent" />
          <div className="absolute -right-20 bottom-0 h-44 w-44 rounded-full border border-[#AFC75A]/30" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#CFE2A1] bg-white/70 px-3 py-2 text-[#52670F] shadow-sm">
                <Sparkles className="h-4 w-4" />
                <p className="text-xs font-black tracking-[0.22em] uppercase">{workspaceRole} workspace</p>
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl sm:text-6xl font-black leading-none tracking-[-0.025em]">{title}</h1>
              <p className="mt-5 max-w-2xl text-sm sm:text-base leading-7 text-[#5E6256]">{workspaceCopy}</p>
            </div>
            <div className="rounded-[1.4rem] border border-[#DDE8BE] bg-white/72 p-4 backdrop-blur shadow-[0_18px_45px_rgba(82,103,15,0.10)]">
              <p className="text-xs font-black tracking-[0.18em] text-[#52670F] uppercase">One EventOS session</p>
              <p className="mt-3 text-sm leading-6 text-[#5E6256]">
                Use Dashboard Options on the main page to move between Organizer, Participant, Volunteer, and Sponsor.
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#52670F] px-4 py-2 text-xs font-black text-white shadow-[0_12px_28px_rgba(82,103,15,0.20)]"
              >
                Switch workspace <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {error && <p className="relative mt-3 text-xs text-red-500">{error}</p>}
        </section>

        {children}
      </main>
    </div>
  );
}
