import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uzjkxhfkqrpqfulgjmnj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_szaYS7qm3TDwrcfkQlQbpw_-egb5RgF';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
