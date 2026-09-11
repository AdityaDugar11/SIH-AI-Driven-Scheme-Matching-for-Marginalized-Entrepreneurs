import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://givyetklwfexhjwhlqew.supabase.co'
const supabaseAnonKey = 'sb_publishable_YSkDTDa2Oafn-nqocXoNVA_YiPbnFCW'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
