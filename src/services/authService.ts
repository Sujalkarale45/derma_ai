import type { User, UserRole } from '../types';

const MOCK_USERS: Record<string, User> = {
  'patient@demo.com': {
    id: 'p-demo-001', name: 'Priya Sharma', email: 'patient@demo.com',
    role: 'patient', phone: '+91 9876543210',
    location: 'Satara, Maharashtra', language_pref: 'en',
    avatar_url: 'https://i.pravatar.cc/80?img=47',
    created_at: '2026-01-15T08:00:00', updated_at: '2026-04-01T08:00:00',
  },
  'doctor@demo.com': {
    id: 'd-demo-001', name: 'Dr. Rajesh Kulkarni', email: 'doctor@demo.com',
    role: 'doctor', phone: '+91 9765432100',
    location: 'Pune, Maharashtra', language_pref: 'en',
    avatar_url: 'https://i.pravatar.cc/80?img=11',
    created_at: '2026-01-10T08:00:00', updated_at: '2026-04-01T08:00:00',
  },
  'admin@demo.com': {
    id: 'a-demo-001', name: 'Admin User', email: 'admin@demo.com',
    role: 'admin', phone: '+91 9000000001',
    location: 'Mumbai, Maharashtra', language_pref: 'en',
    avatar_url: undefined,
    created_at: '2025-10-01T08:00:00', updated_at: '2026-04-01T08:00:00',
  },
};

const DEMO_PASSWORD = 'demo1234';
const USE_SUPABASE = (() => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    return url.startsWith('http');
  } catch {
    return false;
  }
})();

// ─── Login ──────────────────────────────────────────────────────────────────
export async function login(email: string, password: string, role: UserRole): Promise<User | null> {
  if (USE_SUPABASE) {
    try {
      const { supabase } = await import('./supabase');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) return null;
      const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single();
      return (profile as User) ?? null;
    } catch {
      return null;
    }
  }

  await new Promise(r => setTimeout(r, 600));
  const mockUser = MOCK_USERS[email.toLowerCase()];
  if (mockUser && password === DEMO_PASSWORD && mockUser.role === role) {
    return mockUser;
  }
  return null;
}

// ─── Register ───────────────────────────────────────────────────────────────
export async function register(
  name: string,
  email: string,
  password: string,
  role: UserRole,
  extra: Record<string, unknown> = {}
): Promise<User | null> {
  if (USE_SUPABASE) {
    try {
      const { supabase } = await import('./supabase');
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error || !data.user) return null;
      const newProfile: User = {
        id: data.user.id, name, email, role,
        phone: (extra.phone as string) || '',
        location: extra.state ? `${extra.village || extra.city || ''}, ${extra.state}` : '',
        language_pref: (extra.language_pref as string) || 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      // Use any to bypass Supabase generics typing issue with table schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from('users').insert(newProfile as any);
      return newProfile;
    } catch {
      return null;
    }
  }

  await new Promise(r => setTimeout(r, 800));
  const newUser: User = {
    id: `${role}-${Date.now()}`, name, email, role,
    phone: (extra.phone as string) || '',
    location: extra.state ? `${extra.village || extra.city || ''}, ${extra.state}` : '',
    language_pref: (extra.language_pref as string) || 'en',
    avatar_url: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return newUser;
}

// ─── Logout ─────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  if (USE_SUPABASE) {
    try {
      const { supabase } = await import('./supabase');
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  await new Promise(r => setTimeout(r, 200));
}
