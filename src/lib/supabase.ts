import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // AsyncStorage persists the session so users stay logged in
    // between app restarts, instead of having to sign in every time.
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Disable URL-based session detection — that's a web-only auth flow
    // (magic link redirects in a browser tab) and doesn't apply in React Native.
    detectSessionInUrl: false,
  },
});