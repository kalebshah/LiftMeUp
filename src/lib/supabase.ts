import { createClient } from '@supabase/supabase-js';

// These will be environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          avatar: string;
          password_hash: string;
          created_at: string;
          last_accessed_at: string;
          is_public: boolean;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      custom_workouts: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          description: string;
          icon: string;
          color: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['custom_workouts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['custom_workouts']['Insert']>;
      };
      custom_exercises: {
        Row: {
          id: string;
          workout_id: string;
          name: string;
          sets: number;
          rep_range_min: number;
          rep_range_max: number;
          weight_range_min: number;
          weight_range_max: number;
          unit: string;
          order_index: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['custom_exercises']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['custom_exercises']['Insert']>;
      };
    };
  };
}
