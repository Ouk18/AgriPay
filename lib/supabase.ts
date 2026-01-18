
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://thaictboldgqzlwesgpv.supabase.co';
const supabaseAnonKey = 'sb_publishable__uniQVgA0_4wSz5w-0irLQ_10XlHRuc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Indicates whether the Supabase client is correctly configured with required environment variables.
 * Since the credentials are hardcoded in this version, it returns true if they are non-empty.
 */
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;
