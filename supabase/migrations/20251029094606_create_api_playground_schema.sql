/*
  # API Playground Database Schema

  This migration creates the complete database structure for the API Playground application.

  ## New Tables
  
  ### `collections`
  Stores saved request collections/folders for organizing API requests
  - `id` (uuid, primary key) - Unique collection identifier
  - `user_id` (uuid, nullable) - Future support for multi-user (currently null for single-user)
  - `name` (text) - Collection name
  - `description` (text) - Optional collection description
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `saved_requests`
  Stores individual saved API requests with full configuration
  - `id` (uuid, primary key) - Unique request identifier
  - `collection_id` (uuid, foreign key) - Parent collection reference
  - `name` (text) - Request name/title
  - `method` (text) - HTTP method (GET, POST, PUT, etc.)
  - `url` (text) - Request URL
  - `headers` (jsonb) - Request headers as key-value pairs
  - `query_params` (jsonb) - Query parameters as key-value pairs
  - `body` (jsonb) - Request body content and type
  - `auth` (jsonb) - Authentication configuration
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `request_history`
  Tracks all executed API requests for history feature
  - `id` (uuid, primary key) - Unique history entry identifier
  - `method` (text) - HTTP method used
  - `url` (text) - Request URL
  - `headers` (jsonb) - Headers sent
  - `query_params` (jsonb) - Query parameters used
  - `body` (jsonb) - Request body sent
  - `auth` (jsonb) - Authentication used
  - `response_status` (integer) - HTTP response status code
  - `response_time` (integer) - Response time in milliseconds
  - `response_size` (integer) - Response size in bytes
  - `response_headers` (jsonb) - Response headers received
  - `response_body` (text) - Response body content
  - `executed_at` (timestamptz) - Request execution timestamp

  ### `environments`
  Stores environment variables for dynamic request values
  - `id` (uuid, primary key) - Unique environment identifier
  - `name` (text) - Environment name (e.g., "Production", "Development")
  - `variables` (jsonb) - Key-value pairs of environment variables
  - `is_active` (boolean) - Whether this environment is currently active
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on all tables
  - Currently configured for single-user access (no auth required)
  - Policies allow full access for all operations
  - Ready for future multi-user authentication integration

  ## Notes
  
  1. All tables use UUID primary keys with automatic generation
  2. Timestamps are automatically managed with default values and triggers
  3. JSONB is used for flexible storage of headers, params, and configuration
  4. Foreign key constraints ensure data integrity
  5. Indexes are added for common query patterns
*/

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create saved_requests table
CREATE TABLE IF NOT EXISTS saved_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  name text NOT NULL,
  method text NOT NULL DEFAULT 'GET',
  url text NOT NULL,
  headers jsonb DEFAULT '{}'::jsonb,
  query_params jsonb DEFAULT '{}'::jsonb,
  body jsonb DEFAULT '{}'::jsonb,
  auth jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create request_history table
CREATE TABLE IF NOT EXISTS request_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method text NOT NULL,
  url text NOT NULL,
  headers jsonb DEFAULT '{}'::jsonb,
  query_params jsonb DEFAULT '{}'::jsonb,
  body jsonb DEFAULT '{}'::jsonb,
  auth jsonb DEFAULT '{}'::jsonb,
  response_status integer,
  response_time integer,
  response_size integer,
  response_headers jsonb DEFAULT '{}'::jsonb,
  response_body text,
  executed_at timestamptz DEFAULT now()
);

-- Create environments table
CREATE TABLE IF NOT EXISTS environments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  variables jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_requests_collection_id ON saved_requests(collection_id);
CREATE INDEX IF NOT EXISTS idx_request_history_executed_at ON request_history(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_environments_is_active ON environments(is_active);

-- Enable Row Level Security
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE environments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for single-user access (allow all operations)
-- These can be updated later for multi-user authentication

CREATE POLICY "Allow all access to collections"
  ON collections FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to saved_requests"
  ON saved_requests FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to request_history"
  ON request_history FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to environments"
  ON environments FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to automatically update updated_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_collections_updated_at'
  ) THEN
    CREATE TRIGGER update_collections_updated_at
      BEFORE UPDATE ON collections
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_saved_requests_updated_at'
  ) THEN
    CREATE TRIGGER update_saved_requests_updated_at
      BEFORE UPDATE ON saved_requests
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_environments_updated_at'
  ) THEN
    CREATE TRIGGER update_environments_updated_at
      BEFORE UPDATE ON environments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;