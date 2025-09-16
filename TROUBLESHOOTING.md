# Troubleshooting Guide

## PostgreSQL "role postgres does not exist" Error

### Problem
The backend service fails to start with the error:
```
postgres-1  | FATAL:  role "postgres" does not exist
backend-1   | Error hint: undefined
backend-1 exited with code 1
```

### Root Cause
This error occurs when PostgreSQL doesn't properly initialize the default "postgres" role during container startup. This can happen due to:
1. Corrupted or incomplete PostgreSQL data volume
2. Missing initialization scripts
3. Configuration issues with PostgreSQL container

### Solution

#### Option 1: Clean Restart (Recommended)
1. Stop all containers:
   ```bash
   docker-compose down
   ```

2. Remove the PostgreSQL data volume:
   ```bash
   docker volume rm neovolt_postgres_data
   ```
   Or use the provided cleanup script:
   ```bash
   ./cleanup-postgres.sh
   ```

3. Start the services:
   ```bash
   docker-compose up --build
   ```

#### Option 2: Manual Database Reset
If you need to preserve some data, you can manually reset the PostgreSQL role:

1. Connect to the PostgreSQL container:
   ```bash
   docker-compose exec postgres psql -U postgres -d neovolt
   ```

2. Create the postgres role:
   ```sql
   CREATE ROLE postgres WITH LOGIN SUPERUSER CREATEDB CREATEROLE PASSWORD 'neovolt123';
   GRANT ALL PRIVILEGES ON DATABASE neovolt TO postgres;
   ```

### What Was Fixed

1. **Enhanced PostgreSQL Configuration**:
   - Added proper initialization scripts in `init-db/` directory
   - Improved health check settings with longer timeouts
   - Added proper authentication method configuration

2. **Robust Backend Connection Testing**:
   - Added retry logic with exponential backoff
   - Better error reporting and debugging information
   - Increased connection timeout and retry attempts

3. **Initialization Scripts**:
   - `init-db/01-init.sql`: SQL script to ensure postgres role exists
   - `init-db/02-setup-role.sh`: Shell script for additional role setup
   - Both scripts run automatically when PostgreSQL starts for the first time

### Verification

After applying the fix, you should see:
1. PostgreSQL starts without role errors
2. Backend successfully connects to the database
3. All services start in the correct order
4. Frontend can make API calls successfully

### Monitoring

Check the logs to ensure everything is working:
```bash
docker-compose logs -f
```

Look for these success messages:
- `✅ Database connection successful!`
- `Server running on port 3001`
- `Postgres role setup completed successfully!`