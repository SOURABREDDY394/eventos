import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

function isDashboardRole(role: string | undefined): role is UserRole {
  return role === 'organizer' || role === 'participant' || role === 'volunteer' || role === 'sponsor';
}

export function DashboardLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, continueAs, signOut } = useAuth();
  const [error, setError] = useState('');
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

  return (
    <div className="eventos-light-app min-h-screen bg-[#F9F8F1] text-[#14150F]">
      <main className="max-w-[92rem] mx-auto px-4 sm:px-6 py-5 sm:py-7">
        <div className="mb-6 rounded-full bg-white/92 backdrop-blur-xl border border-[#E4E0D4] shadow-[0_10px_30px_rgba(35,40,20,0.08)] px-4 py-3 flex items-center justify-between gap-4">
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

        <section className="relative overflow-hidden rounded-[2rem] bg-white border border-[#E7E1D2] px-5 py-5 sm:px-7 sm:py-6 shadow-sm mb-6">
          <div className="absolute right-0 top-0 h-36 w-56 rounded-full bg-[#DCE7BD]/70 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <p className="text-xs font-black tracking-[0.22em] text-[#6A7D1A] uppercase">{workspaceRole} workspace</p>
              <h1 className="text-3xl sm:text-5xl font-black text-[#14150F] mt-1 leading-none">{title}</h1>
            </div>
            <p className="max-w-md text-sm text-[#5E6256]">
              One login opens every workspace. Use Dashboard Options on the main page to move between Organizer, Participant, Volunteer, and Sponsor.
            </p>
          </div>
          {error && <p className="relative mt-3 text-xs text-red-500">{error}</p>}
        </section>

        {children}
      </main>
    </div>
  );
}
