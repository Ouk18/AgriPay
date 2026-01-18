
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://thaictboldgqzlwesgpv.supabase.co';
const supabaseAnonKey = 'sb_publishable__uniQVgA0_4wSz5w-0irLQ_10XlHRuc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
