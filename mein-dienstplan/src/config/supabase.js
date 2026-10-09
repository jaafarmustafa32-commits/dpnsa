import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://abjprvygnheicctbnkim.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_5Ag-5bZkQF2FZulkB_b-Rg_cI9c4YK5'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)