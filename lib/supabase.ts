import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// On web SSR, AsyncStorage accesses `window` which doesn't exist.
// Use a no-op storage fallback for server-side, real AsyncStorage for client.
const isServer = typeof window === 'undefined';

const noopStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isServer ? noopStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: !isServer,
    detectSessionInUrl: Platform.OS === 'web' && !isServer,
    lock: async (name: string, acquireTimeout: number, fn: () => Promise<any>) => fn(),
    storageKey: 'househunt-auth',
  },
});
