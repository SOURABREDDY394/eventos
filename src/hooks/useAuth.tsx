import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Profile, UserRole } from '@/types';

export type DemoUser = {
  id: string;
  name: string;
  username: string;
  role: UserRole;
};

type AuthContextValue = {
  user: Profile | null;
  demoUser: DemoUser | null;
  currentRole: UserRole | null;
  loading: boolean;
  loginDemo: () => Profile;
  continueAs: (role: UserRole) => Profile;
  signOut: () => Promise<void>;
};

const CURRENT_ROLE_KEY = 'currentRole';
const CURRENT_USER_KEY = 'currentUser';
const OLD_AUTH_USER_KEY = 'eventos_current_user';

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

export function getDashboardRoute(role?: UserRole | null) {
  return role ? roleRoutes[role] : '/login';
}

export function profileFromDemoUser(demoUser: DemoUser): Profile {
  return {
    id: demoUser.id,
    full_name: demoUser.name,
    username: demoUser.username,
    email: '',
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
    if (parsed.id && parsed.username && parsed.role === storedRole && isUserRole(parsed.role)) {
      return parsed as DemoUser;
    }

    return demoUsers[storedRole];
  } catch {
    return null;
  }
}

function writeDemoUser(role: UserRole) {
  const demoUser = demoUsers[role];
  localStorage.setItem(CURRENT_ROLE_KEY, role);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demoUser));
  localStorage.removeItem(OLD_AUTH_USER_KEY);
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

  const loginDemo = useCallback(() => {
    const nextDemoUser = writeDemoUser('organizer');
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
