/*
=========================================
    Supabase Configuration
=========================================
*/

// Your Supabase Project URL
const SUPABASE_URL = "https://ghhevrdkeljwclcxosux.supabase.co";

// Your Publishable (Anon) Key
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_H8cr3EPcdTOYPykuaXOHpA_kbsXuUgd";

// Initialize Supabase
// Explicit auth options so behavior is predictable across pages:
// - persistSession: keep the session in localStorage between page loads
// - autoRefreshToken: refresh the access token before it expires
// - detectSessionInUrl: false, since we don't use magic links / OAuth redirects
const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  },
);
