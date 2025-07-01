
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lvsgkqcnivbmisbfegkv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2c2drcWNuaXZibWlzYmZlZ2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNzUyNzQsImV4cCI6MjA2MzY1MTI3NH0.9MLGnrFby62Zpjq5ORttAXG28Ie8-RPsni-G9-mpQpo'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})
