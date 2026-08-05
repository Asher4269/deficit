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
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
