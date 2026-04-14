import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isConfigured = !!(
  supabaseUrl &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
);

// A no-op stub that returns an error-shaped promise for every call
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noopStub: any = new Proxy(
  {},
  {
    get() {
      return () =>
        new Proxy(() => Promise.resolve({ data: null, error: new Error('Demo mode') }), {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          get(target: any, prop) {
            return target[prop] ?? target;
          },
        });
    },
  }
);

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: SupabaseClient = isConfigured ? new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
}) : noopStub;
