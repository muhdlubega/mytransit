import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../utils/constants";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Database = {
  public: {
    Tables: {
      favorites: {
        Row: {
          id: string;
          user_id: string;
          vehicle_id: string;
          route_id: string | null;
          vehicle_type: string | null;
          display_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vehicle_id: string;
          route_id?: string | null;
          vehicle_type?: string | null;
          display_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vehicle_id?: string;
          route_id?: string | null;
          vehicle_type?: string | null;
          display_name?: string;
          created_at?: string;
        };
      };
      recent_searches: {
        Row: {
          id: string;
          user_id: string;
          search_query: string;
          search_type: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          search_query: string;
          search_type: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          search_query?: string;
          search_type?: string;
          timestamp?: string;
        };
      };
    };
  };
};
