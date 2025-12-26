
import { createClient } from '@supabase/supabase-js';

// NOTE: In a production app, these should proceed from process.env
const SUPABASE_URL = 'https://vyubnyyitzoiprusykyu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dWJueXlpdHpvaXBydXN5a3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NjUzNTQsImV4cCI6MjA4MjI0MTM1NH0.GXpuu5ZTuPsRb2d616fdgiFNkDdAjv9RoWn0U-TN5Bs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
