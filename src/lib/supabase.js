import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL 
  || 'https://nudencgumhvpokqkskvn.supabase.co'

const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY 
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZGVuY2d1bWh2cG9rcWtza3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzkwODIsImV4cCI6MjA4OTc1NTA4Mn0.ff3i4J3Q-erJXej12gxoc8K6NCTCUh-CGx1INdfikjU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
