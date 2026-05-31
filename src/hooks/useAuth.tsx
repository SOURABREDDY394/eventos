import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Profile, UserRole } from '@/types';

export type DemoUser = {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: UserRole;
};

type AuthContextValue = {
  user: Profile | null;
  demoUser: DemoUser | null;
  currentRole: UserRole | null;
  loading: boolean;
  loginDemo: (input?: { name?: string; username?: string; email?: string }) => Profile;
  continueAs: (role: UserRole) => Profile;
  signOut: () => Promise<void>;
};

const CURRENT_ROLE_KEY = 'currentRole';
const CURRENT_USER_KEY = 'currentUser';
const OLD_AUTH_USER_KEY = 'eventos_current_user';
const PROFILES_KEY = 'eventos_profiles';

export const demoUsers: Record<UserRole, DemoUser> = {
  organizer: {
    id: 'demo-organizer',
    name: 'Event Organizer',
    username: 'organizer',
    role: 'organizer',
  },
  participant: {
    id: 'demo-participant',
    name: 'Sourab Reddy',
    username: 'sourab',
    role: 'participant',
  },
  volunteer: {
    id: 'demo-volunteer',
    name: 'Volunteer User',
    username: 'volunteer',
    role: 'volunteer',
  },
  sponsor: {
    id: 'demo-sponsor',
    name: 'Sponsor Partner',
    username: 'sponsor',
    role: 'sponsor',
  },
};

const roleRoutes: Record<UserRole, string> = {
  organizer: '/dashboard/organizer',
  participant: '/dashboard/participant',
  volunteer: '/dashboard/volunteer',
  sponsor: '/dashboard/sponsor',
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isUserRole(role: string | null): role is UserRole {
  return role === 'organizer' || role === 'participant' || role === 'volunteer' || role === 'sponsor';
}

function normalizeUsername(value?: string) {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 28);
}

function nameToUsername(name?: string) {
  return normalizeUsername(name?.replace(/\s+/g, '') || 'eventosuser');
}

function demoIdFromUsername(username: string) {
  return `demo-${username || 'eventosuser'}`;
}

function upsertLocalProfile(profile: Profile) {
  try {
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]') as Profile[];
    const index = profiles.findIndex(item => item.id === profile.id || item.username === profile.username);
    if (index === -1) profiles.push(profile);
    else profiles[index] = { ...profiles[index], ...profile };
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {
    localStorage.setItem(PROFILES_KEY, JSON.stringify([profile]));
  }
}

export function getDashboardRoute(role?: UserRole | null) {
  return role ? roleRoutes[role] : '/login';
}

export function profileFromDemoUser(demoUser: DemoUser): Profile {
  return {
    id: demoUser.id,
    full_name: demoUser.name,
    username: demoUser.username,
    email: demoUser.email || '',
    role: demoUser.role,
    avatar_url: '',
    bio: '',
    passport_slug: demoUser.username,
    created_at: '',
  };
}

function readDemoUser(): DemoUser | null {
  try {
    const storedRole = localStorage.getItem(CURRENT_ROLE_KEY);
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (!storedUser || !isUserRole(storedRole)) return null;

    const parsed = JSON.parse(storedUser) as Partial<DemoUser>;
    if (parsed.id && parsed.username && isUserRole(storedRole)) {
      return {
        id: parsed.id,
        name: parsed.name || parsed.username,
        username: parsed.username,
        email: parsed.email || '',
        role: storedRole,
      };
    }

    return demoUsers[storedRole];
  } catch {
    return null;
  }
}

function writeDemoUser(role: UserRole, input?: { name?: string; username?: string; email?: string }) {
  const existing = readDemoUser();
  const username = normalizeUsername(input?.username) || existing?.username || nameToUsername(input?.name) || 'eventosuser';
  const name = (input?.name || existing?.name || 'EventOS User').trim();
  const demoUser: DemoUser = {
    id: existing?.id || demoIdFromUsername(username),
    name,
    username,
    email: input?.email?.trim() || existing?.email || '',
    role,
  };
  const profile = profileFromDemoUser(demoUser);
  localStorage.setItem(CURRENT_ROLE_KEY, role);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demoUser));
  localStorage.removeItem(OLD_AUTH_USER_KEY);
  upsertLocalProfile(profile);
  return demoUser;
}

function clearDemoUser() {
  localStorage.removeItem(CURRENT_ROLE_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(OLD_AUTH_USER_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [demoUser, setDemoUser] = useState<DemoUser | null>(() => readDemoUser());
  const [loading] = useState(false);

  useEffect(() => {
    const handleStorage = () => setDemoUser(readDemoUser());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const continueAs = useCallback((role: UserRole) => {
    const nextDemoUser = writeDemoUser(role);
    setDemoUser(nextDemoUser);
    return profileFromDemoUser(nextDemoUser);
  }, []);

  const loginDemo = useCallback((input?: { name?: string; username?: string; email?: string }) => {
    const nextDemoUser = writeDemoUser('organizer', input);
    setDemoUser(nextDemoUser);
    return profileFromDemoUser(nextDemoUser);
  }, []);

  const signOut = useCallback(async () => {
    clearDemoUser();
    setDemoUser(null);
  }, []);

  const user = demoUser ? profileFromDemoUser(demoUser) : null;
  const currentRole = demoUser?.role ?? null;

  const value = useMemo(
    () => ({ user, demoUser, currentRole, loading, loginDemo, continueAs, signOut }),
    [user, demoUser, currentRole, loading, loginDemo, continueAs, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider.');
  return ctx;
}
