-- Create backup_logs table to track backup operations
CREATE TABLE IF NOT EXISTS backup_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL, -- 'backup_created', 'backup_restored', 'retention_policy_applied', etc.
  filename VARCHAR(255),
  size_bytes BIGINT,
  tables_included JSONB,
  status VARCHAR(50) NOT NULL, -- 'completed', 'failed', etc.
  error_message TEXT,
  details JSONB,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create backup_schedules table to store automated backup schedules
CREATE TABLE IF NOT EXISTS backup_schedules (
  id SERIAL PRIMARY KEY,
  frequency VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
  time VARCHAR(5) NOT NULL, -- 'HH:MM' format
  is_active BOOLEAN DEFAULT TRUE,
  last_run TIMESTAMP WITH TIME ZONE,
  retention_policy JSONB, -- Store retention policy settings
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create backup_retention_policies table to store retention policy settings
CREATE TABLE IF NOT EXISTS backup_retention_policies (
  id SERIAL PRIMARY KEY,
  daily INTEGER NOT NULL DEFAULT 7, -- days to keep daily backups
  weekly INTEGER NOT NULL DEFAULT 4, -- weeks to keep weekly backups
  monthly INTEGER NOT NULL DEFAULT 12, -- months to keep monthly backups
  yearly INTEGER NOT NULL DEFAULT 7, -- years to keep yearly backups
  is_active BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a storage bucket for backups if it doesn't exist
-- Note: This needs to be done via the Supabase dashboard or API
-- The bucket name should be 'database-backups'
