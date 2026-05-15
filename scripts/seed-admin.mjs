/**
 * Creates the bootstrap admin in Supabase Auth + public.users
 *
 * Usage:
 *   1. Add SUPABASE_SERVICE_ROLE_KEY to derma-ai/.env (Dashboard → Settings → API → service_role)
 *   2. npm run seed:admin
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');

function loadEnv() {
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.VITE_BOOTSTRAP_ADMIN_EMAIL || 'admin@dermaai.com';
const password = process.env.VITE_BOOTSTRAP_ADMIN_PASSWORD || 'DermaAdmin@2026';

if (!url?.startsWith('http')) {
  console.error('Missing VITE_SUPABASE_URL in .env');
  process.exit(1);
}
if (!serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error('Get it from Supabase Dashboard → Project Settings → API → service_role');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: list } = await supabase.auth.admin.listUsers();
const existing = list?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

let userId = existing?.id;

if (!userId) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: 'DERMA AI Admin', role: 'admin' },
  });
  if (error) {
    console.error('createUser failed:', error.message);
    process.exit(1);
  }
  userId = data.user.id;
  console.log('Created auth user:', email);
} else {
  await supabase.auth.admin.updateUserById(userId, { password });
  console.log('Auth user already exists, password updated:', email);
}

const profile = {
  id: userId,
  name: 'DERMA AI Admin',
  email,
  role: 'admin',
  phone: '+91 9000000001',
  location: 'Mumbai, Maharashtra',
  language_pref: 'en',
  updated_at: new Date().toISOString(),
};

const { error: upsertErr } = await supabase.from('users').upsert(profile, { onConflict: 'id' });
if (upsertErr) {
  console.error('users upsert failed:', upsertErr.message);
  console.error('Ensure public.users table exists (see supabase/migrations).');
  process.exit(1);
}

console.log('\n✅ Admin ready');
console.log('   Email:   ', email);
console.log('   Password:', password);
console.log('   Login at /login → select Admin\n');
