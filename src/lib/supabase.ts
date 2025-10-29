import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Collection = {
  id: string;
  user_id: string | null;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type SavedRequest = {
  id: string;
  collection_id: string | null;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  query_params: Record<string, string>;
  body: {
    type: 'none' | 'json' | 'form' | 'raw' | 'xml';
    content: string;
  };
  auth: {
    type: 'none' | 'bearer' | 'apikey' | 'basic';
    token?: string;
    key?: string;
    value?: string;
    username?: string;
    password?: string;
  };
  created_at: string;
  updated_at: string;
};

export type RequestHistory = {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  query_params: Record<string, string>;
  body: {
    type: string;
    content: string;
  };
  auth: Record<string, unknown>;
  response_status: number | null;
  response_time: number | null;
  response_size: number | null;
  response_headers: Record<string, string>;
  response_body: string | null;
  executed_at: string;
};

export type Environment = {
  id: string;
  name: string;
  variables: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
