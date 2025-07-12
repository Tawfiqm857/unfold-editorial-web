
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://atwlsvlzejxitpsltapl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0d2xzdmx6ZWp4aXRwc2x0YXBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjgzMTAsImV4cCI6MjA2NjM0NDMxMH0.-XGrPL0VywL4fA7paNn22vpGqfHTu_KF199P7ycYWQ8'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
})
