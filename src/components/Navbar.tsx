import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Building2, HeartHandshake, Menu, Shield, UserCog, UserPlus, X } from 'lucide-react';
import { getDashboardRoute, useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

const AI_PROMPT_KEY = 'eventos_ai_prompt';

const roles: Array<{ value: UserRole; label: string; icon: typeof UserCog; desc: string }> = [
  { value: 'organizer', label: 'Organizer', icon: UserCog, desc: 'Create events, approve applications, manage proof' },
  { value: 'participant', label: 'Participant', icon: UserPlus, desc: 'Browse events, apply, collect QR tickets' },
  { value: 'volunteer', label: 'Volunteer', icon: HeartHandshake, desc: 'Apply for roles, finish tasks, build proof' },
  { value: 'sponsor', label: 'Sponsor', icon: Building2, desc: 'Find events and manage sponsor interest' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const location = useLocation();
  const { user, continueAs } = useAuth();
  const isPublicSurface = !location.pathname.startsWith('/dashboard');

  if (!isPublicSurface) return null;

  const selectRole = (role: UserRole) => {
    continueAs(role);
    setDashboardOpen(false);
    setMobileOpen(false);
  };

  const roleDestination = (role: UserRole) => {
    const pendingPrompt = localStorage.getItem(AI_PROMPT_KEY);
    return role === 'organizer' && pendingPrompt ? '/dashboard/organizer/create-with-ai' : getDashboardRoute(role);
  };

  const rolePanel = (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {roles.map((role) => {
        const Icon = role.icon;
        const active = user?.role === role.value;

        return (
          <Link
            key={role.value}
            to={roleDestination(role.value)}
            onClick={() => selectRole(role.value)}
            className={`goavo-card-effect text-left rounded-3xl border bg-white p-5 shadow-sm ${
              active ? 'border-[#52670F]' : 'border-[#E7E1D2]'
            }`}
          >
            <div className="w-11 h-11 rounded-2xl bg-[#EEF5D9] border border-[#DCE8BE] flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-[#52670F]" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-black text-[#14150F]">{role.label}</h3>
              {active && <span className="rounded-full bg-[#EEF5D9] px-2 py-0.5 text-[10px] font-black text-[#52670F]">Current</span>}
            </div>
            <p className="text-xs text-[#6B705D] mt-1">Open workspace</p>
            <p className="text-sm text-[#5E6256] leading-5 mt-3">{role.desc}</p>
          </Link>
        );
      })}
    </div>
  );

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-4">
      <div className="relative max-w-[82rem] mx-auto">
        <div className="rounded-full bg-white/88 backdrop-blur-xl border border-[#E4E0D4] shadow-[0_8px_24px_rgba(35,40,20,0.08)]">
          <div className="flex items-center justify-between h-16 px-5 sm:px-7">
            <Link to="/" className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-full bg-[#EEF5D9] border border-[#DCE8BE] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#5C7415]" />
              </span>
              <span className="text-2xl font-black text-[#6A7D1A] tracking-tight">EventOS</span>
            </Link>

            <div className="hidden lg:flex items-center gap-2 text-sm font-semibold text-[#33362E]">
              <span>With proof from</span>
              <span className="rounded-md border-b-2 border-[#6A7D1A] px-1 font-black tracking-wide">EVENT OPS</span>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/events" className="rounded-full border border-[#DDE3CA] px-4 py-2 text-sm font-bold text-[#52670F] hover:bg-[#F2F6E7] transition-colors">Events</Link>
              <button
                onClick={() => setDashboardOpen(open => !open)}
                className="rounded-full bg-[#52670F] px-5 py-2 text-sm font-black text-white"
              >
                Dashboard
              </button>
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-[#1F2416]">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileOpen && (
            <div className="md:hidden px-5 pb-5 space-y-3">
              <Link to="/events" className="block rounded-full border border-[#DDE3CA] px-4 py-2 text-center text-sm font-bold text-[#52670F]">Events</Link>
              <button
                onClick={() => setDashboardOpen(open => !open)}
                className="block w-full rounded-full bg-[#52670F] px-5 py-2 text-center text-sm font-black text-white"
              >
                Dashboard Options
              </button>
              {dashboardOpen && <div className="pt-2">{rolePanel}</div>}
            </div>
          )}
        </div>

        {dashboardOpen && !mobileOpen && (
          <div className="absolute left-0 right-0 top-[4.7rem] rounded-[2rem] bg-[#F9F8F1]/96 backdrop-blur-xl border border-[#E4E0D4] shadow-[0_24px_70px_rgba(35,40,20,0.18)] p-4">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-2 mb-4 px-1">
              <div>
                <p className="text-xs font-black tracking-[0.22em] text-[#6A7D1A] uppercase">Dashboard options</p>
                <h2 className="text-2xl font-black text-[#14150F]">Choose your EventOS workspace</h2>
              </div>
              <p className="text-sm text-[#5E6256] max-w-md">You are logged in once. Open any workspace from here without signing in again.</p>
            </div>
            {rolePanel}
          </div>
        )}
      </div>
    </nav>
  );
}
