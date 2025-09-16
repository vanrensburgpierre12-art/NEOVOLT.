-- Initialize PostgreSQL database and ensure postgres role exists
-- This script runs when the PostgreSQL container starts for the first time

-- Ensure the postgres role exists and has proper permissions
DO $$
BEGIN
    -- Create postgres role if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
        CREATE ROLE postgres WITH LOGIN SUPERUSER CREATEDB CREATEROLE PASSWORD 'neovolt123';
    END IF;
    
    -- Grant all privileges on the database to postgres role
    GRANT ALL PRIVILEGES ON DATABASE neovolt TO postgres;
    
    -- Ensure postgres role can create databases
    ALTER ROLE postgres CREATEDB;
    ALTER ROLE postgres CREATEROLE;
    ALTER ROLE postgres SUPERUSER;
END
$$;

-- Create the neovolt database if it doesn't exist
SELECT 'CREATE DATABASE neovolt'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'neovolt')\gexec

-- Connect to the neovolt database
\c neovolt;

-- Ensure postgres role has all privileges on neovolt database
GRANT ALL PRIVILEGES ON DATABASE neovolt TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;