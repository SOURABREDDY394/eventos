import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Building2, HeartHandshake, Shield, UserCog, UserPlus } from 'lucide-react';
import { demoUsers, getDashboardRoute, useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

const AI_PROMPT_KEY = 'eventos_ai_prompt';

const roles: Array<{ value: UserRole; label: string; icon: typeof UserCog; desc: string }> = [
  { value: 'organizer', label: 'Organizer', icon: UserCog, desc: 'Manage events, teams, sponsors, and proof' },
  { value: 'participant', label: 'Participant', icon: UserPlus, desc: 'Register, attend, and collect certificates' },
  { value: 'volunteer', label: 'Volunteer', icon: HeartHandshake, desc: 'Track tasks, hours, and verified skills' },
  { value: 'sponsor', label: 'Sponsor', icon: Building2, desc: 'Discover events and manage sponsor interest' },
];

export default function Login() {
  const navigate = useNavigate();
  const { continueAs, user, signOut } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleContinue = (role: UserRole) => {
    setSelectedRole(role);
    const profile = continueAs(role);
    const pendingPrompt = localStorage.getItem(AI_PROMPT_KEY);
    navigate(profile.role === 'organizer' && pendingPrompt ? '/dashboard/organizer/create-with-ai' : getDashboardRoute(profile.role), { replace: true });
  };

  const handleSwitchRole = async () => {
    await signOut();
    setSelectedRole(null);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F1] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(213,231,161,0.7),transparent_34rem)]" />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="w-10 h-10 rounded-full bg-[#EEF5D9] border border-[#DCE8BE] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#5C7415]" />
            </span>
            <span className="text-2xl font-black text-[#6A7D1A]">EventOS</span>
          </Link>
          <h1 className="text-4xl sm:text-6xl font-black tracking-0 text-[#14150F]">CONTINUE AS</h1>
          <p className="text-sm sm:text-base text-[#5E6256] mt-3">
            Pick a role to enter the demo product. No signup, password, email confirmation, or SMTP is used.
          </p>
        </div>

        {user && (
          <div className="mb-5 rounded-3xl border border-[#E1DEC9] bg-white px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
            <div>
              <p className="text-sm font-black text-[#14150F]">Current role: {user.full_name}</p>
              <p className="text-xs text-[#5E6256] capitalize">{user.role}</p>
            </div>
            <button onClick={handleSwitchRole} className="rounded-full border border-[#CBD4A9] bg-white px-4 py-2 text-sm font-black text-[#52670F]">
              Clear and switch role
            </button>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            const demoUser = demoUsers[role.value];
            const isSelected = selectedRole === role.value;

            return (
              <button
                key={role.value}
                onClick={() => handleContinue(role.value)}
                className={`group text-left rounded-3xl border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-xl ${
                  isSelected ? 'border-[#52670F]' : 'border-[#E7E1D2]'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#EEF5D9] border border-[#DCE8BE] flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-[#5C7415]" />
                </div>
                <h2 className="text-lg font-black text-[#14150F]">{role.label}</h2>
                <p className="text-xs text-[#6B705D] mt-1">@{demoUser.username}</p>
                <p className="text-sm text-[#5E6256] leading-6 mt-4">{role.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
