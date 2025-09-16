#!/bin/bash
set -e

# This script ensures the postgres role is properly set up
echo "Setting up postgres role..."

# Connect to PostgreSQL and ensure the postgres role exists with proper permissions
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Ensure postgres role exists and has proper permissions
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
            CREATE ROLE postgres WITH LOGIN SUPERUSER CREATEDB CREATEROLE PASSWORD 'neovolt123';
        ELSE
            -- Update existing postgres role to ensure it has all necessary permissions
            ALTER ROLE postgres WITH LOGIN SUPERUSER CREATEDB CREATEROLE PASSWORD 'neovolt123';
        END IF;
    END
    \$\$;
    
    -- Grant all privileges on the database
    GRANT ALL PRIVILEGES ON DATABASE neovolt TO postgres;
    
    -- Connect to neovolt database and set up permissions
    \c neovolt;
    
    -- Grant all privileges on the public schema
    GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
    
    -- Set default privileges for future objects
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
    
    -- Ensure postgres role can connect to the database
    GRANT CONNECT ON DATABASE neovolt TO postgres;
EOSQL

echo "Postgres role setup completed successfully!"