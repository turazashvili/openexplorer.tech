import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      websites: {
        Row: {
          id: string;
          url: string;
          last_scraped: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          last_scraped?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          last_scraped?: string;
          created_at?: string;
        };
      };
      technologies: {
        Row: {
          id: string;
          name: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          created_at?: string;
        };
      };
      website_technologies: {
        Row: {
          website_id: string;
          technology_id: string;
          created_at: string;
        };
        Insert: {
          website_id: string;
          technology_id: string;
          created_at?: string;
        };
        Update: {
          website_id?: string;
          technology_id?: string;
          created_at?: string;
        };
      };
    };
  };
};