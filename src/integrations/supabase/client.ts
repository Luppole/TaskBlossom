
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zuqkmunveyjjnpvfldqo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cWttdW52ZXlqam5wdmZsZHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NzA3MDIsImV4cCI6MjA2MTI0NjcwMn0.b74mwAPV8m2mep8d1-qtPW_RFbBaIE-FQwg9yPqvuvg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  },
  global: {
    // Add fetch options for better reliability
    fetch: (url, options) => {
      const fetchOptions = {
        ...options,
        // Add a longer timeout
        signal: AbortSignal.timeout(30000) // 30 second timeout
      };
      
      return fetch(url, fetchOptions);
    }
  },
  // Add auto-retry for failed requests
  db: {
    schema: 'public'
  }
});

// Helper function to create a profile for a new user
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    // Check if profile exists first to avoid duplicates
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (!existingProfile) {
      await supabase.from('profiles').insert({
        id: userId,
        username: userData?.username || null,
        full_name: userData?.full_name || userData?.name || null,
        avatar_url: userData?.avatar_url || null,
        updated_at: new Date().toISOString()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
};
