-- Add OAuth provider fields to users table
-- Migration: 006_add_oauth_fields.sql

-- Add Google OAuth ID field
ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE;

-- Add Microsoft OAuth ID field  
ALTER TABLE users ADD COLUMN microsoft_id TEXT UNIQUE;

-- Add provider field to track how user signed up
ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local' CHECK(auth_provider IN ('local', 'google', 'microsoft'));

-- Make password_hash optional for OAuth users
-- Note: SQLite doesn't support ALTER COLUMN, so we document this change
-- OAuth users will have NULL password_hash

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_microsoft_id ON users(microsoft_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);