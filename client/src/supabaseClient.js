import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://krbhskeevfgpquensemj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyYmhza2VldmZncHF1ZW5zZW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzY4NDEsImV4cCI6MjA2OTk1Mjg0MX0.GOIwGtT2ZtgVFLa7HIQGlLBCejbb90OvykuXGCVpJI0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)