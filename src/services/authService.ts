import type { User, UserRole } from '../types';

const MOCK_USERS: Record<string, User> = {
  'patient@demo.com': {
    id: 'p-demo-001', name: 'Riya Sharma', email: 'patient@demo.com',
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

/** Default admin for Supabase projects (dev / bootstrap). Change in production. */
export const BOOTSTRAP_ADMIN_EMAIL =
  (import.meta.env.VITE_BOOTSTRAP_ADMIN_EMAIL || 'admin@dermaai.com').toLowerCase();
export const BOOTSTRAP_ADMIN_PASSWORD =
  import.meta.env.VITE_BOOTSTRAP_ADMIN_PASSWORD || 'DermaAdmin@2026';
const BOOTSTRAP_ADMIN_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_BOOTSTRAP_ADMIN === 'true';

const USE_SUPABASE = (() => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    return url.startsWith('http');
  } catch {
    return false;
  }
})();

async function loginBootstrapAdmin(email: string, password: string): Promise<User | null> {
  if (!BOOTSTRAP_ADMIN_ENABLED) return null;
  if (email.toLowerCase() !== BOOTSTRAP_ADMIN_EMAIL || password !== BOOTSTRAP_ADMIN_PASSWORD) {
    return null;
  }

  const { supabase } = await import('./supabase');
  const adminProfile = (userId: string): User => ({
    id: userId,
    name: 'DERMA AI Admin',
    email: BOOTSTRAP_ADMIN_EMAIL,
    role: 'admin',
    phone: '+91 9000000001',
    location: 'Mumbai, Maharashtra',
    language_pref: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  let signInErr = null as { message: string } | null;
  let authUserId: string | null = null;

  const first = await supabase.auth.signInWithPassword({
    email: BOOTSTRAP_ADMIN_EMAIL,
    password: BOOTSTRAP_ADMIN_PASSWORD,
  });
  signInErr = first.error;
  authUserId = first.data.user?.id ?? null;

  if (signInErr) {
    const signUp = await supabase.auth.signUp({
      email: BOOTSTRAP_ADMIN_EMAIL,
      password: BOOTSTRAP_ADMIN_PASSWORD,
      options: { data: { name: 'DERMA AI Admin', role: 'admin' } },
    });
    if (signUp.error) {
      console.error('Bootstrap admin signUp failed:', signUp.error.message);
      return null;
    }
    authUserId = signUp.data.user?.id ?? signUp.data.session?.user?.id ?? null;
    if (!authUserId) {
      const retry = await supabase.auth.signInWithPassword({
        email: BOOTSTRAP_ADMIN_EMAIL,
        password: BOOTSTRAP_ADMIN_PASSWORD,
      });
      signInErr = retry.error;
      authUserId = retry.data.user?.id ?? null;
    } else {
      signInErr = null;
    }
  }

  if (signInErr || !authUserId) {
    console.error(
      'Bootstrap admin login failed. In Supabase: Authentication → Providers → Email → disable "Confirm email".',
      signInErr?.message,
    );
    return null;
  }

  const profile = adminProfile(authUserId);
  await supabase.from('users').upsert(profile as unknown as Record<string, unknown>, { onConflict: 'id' });
  return profile;
}

// ─── Login ──────────────────────────────────────────────────────────────────
export async function login(email: string, password: string, role: UserRole): Promise<User | null> {
  if (USE_SUPABASE) {
    try {
      if (role === 'admin') {
        const bootstrap = await loginBootstrapAdmin(email, password);
        if (bootstrap) return bootstrap;
      }

      const { supabase } = await import('./supabase');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) return null;

      // Try to get full profile from users table
      const { data: profile, error: profileErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) return profile as User;

      // Profile row missing (email not confirmed yet, or trigger delay) —
      // build a minimal User from the auth session so login still works
      if (profileErr) {
        console.warn('Profile row not found, falling back to auth metadata:', profileErr.message);
      }
      const fallback: User = {
        id: data.user.id,
        name: data.user.user_metadata?.name || email.split('@')[0],
        email: data.user.email ?? email,
        role: (data.user.user_metadata?.role as UserRole) ?? role,
        language_pref: 'en',
        created_at: data.user.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Try to create the missing row now
      await supabase.from('users').upsert(fallback as unknown as Record<string, unknown>, { onConflict: 'id' });
      return fallback;
    } catch (err) {
      console.error('Login error:', err);
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
  const userId = USE_SUPABASE
    ? await (async () => {
        try {
          const { supabase } = await import('./supabase');
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name, role } },  // stored in raw_user_meta_data
          });
          if (error || !data.user) return null;
          const newProfile: User = {
            id: data.user.id, name, email, role,
            phone: (extra.phone as string) || '',
            location: extra.state ? `${extra.village || extra.city || ''}, ${extra.state}` : '',
            language_pref: (extra.language_pref as string) || 'en',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await supabase.from('users').insert(newProfile as any);
          return data.user.id;
        } catch {
          return null;
        }
      })()
    : `${role}-${Date.now()}`;

  if (!userId) return null;

  const newUser: User = {
    id: userId, name, email, role,
    phone: (extra.phone as string) || '',
    location: extra.state ? `${extra.village || extra.city || ''}, ${extra.state}` : '',
    language_pref: (extra.language_pref as string) || 'en',
    avatar_url: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // ── Save doctor profile to Firestore ────────────────────────────────────
  if (role === 'doctor') {
    try {
      const { saveDoctorProfile } = await import('./doctorProfileService');
      await saveDoctorProfile({
        id:             userId,
        name,
        email,
        role:           'doctor',
        phone:          (extra.phone as string) || '',
        specialisation: (extra.specialisation as string) || 'General Dermatology',
        reg_number:     (extra.reg_number as string) || '',
        hospital:       (extra.hospital as string) || '',
        city:           (extra.city as string) || '',
        state:          (extra.state as string) || '',
        experience_years: 0,
        lat: 0, lng: 0,
        verified: false,
        rating: 0, total_ratings: 0,
        available_days: [1, 2, 3, 4, 5],
        languages: ['en'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Non-blocking: profile save failure shouldn't block registration
    }
  }

  if (!USE_SUPABASE) await new Promise(r => setTimeout(r, 800));
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

// ─── Google OAuth ────────────────────────────────────────────────────────────
export async function loginWithGoogle(): Promise<void> {
  const { supabase } = await import('./supabase');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/patient/dashboard`,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });
  if (error) throw error;
}

// ─── Sync active Supabase session → returns User or null ─────────────────────
export async function syncSupabaseSession(): Promise<User | null> {
  try {
    const { supabase } = await import('./supabase');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    // Try to load full profile from users table
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) return profile as User;

    // First OAuth login — create profile row
    const newUser: User = {
      id: session.user.id,
      name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
      email: session.user.email ?? '',
      role: 'patient', // default role for Google sign-ups
      avatar_url: session.user.user_metadata?.avatar_url,
      language_pref: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from('users').upsert(newUser as any, { onConflict: 'id' });
    return newUser;
  } catch {
    return null;
  }
}
