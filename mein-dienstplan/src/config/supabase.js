import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jbnxpqovdielnvjpijva.supabase.co'
const supabaseKey = 'sb_publishable_qav5iYo8ENePdLedfwihMw_Mt6vzjEo'

export const supabase = createClient(supabaseUrl, supabaseKey)