-- Create function to create system_settings table
CREATE OR REPLACE FUNCTION create_system_settings_table()
RETURNS void AS $$
BEGIN
  -- Create system_settings table if it doesn't exist
  CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;
