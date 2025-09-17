#!/bin/bash

# Neovolt Database Backup Script
set -e

# Configuration
BACKUP_DIR="/workspace/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="neovolt_backup_${DATE}.sql"
CONTAINER_NAME="neovolt_postgres_1"

echo "🗄️  Starting Neovolt Database Backup..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Check if PostgreSQL container is running
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "❌ Error: PostgreSQL container is not running!"
    echo "Please start the database first with: docker-compose up -d postgres"
    exit 1
fi

# Create database backup
echo "📦 Creating database backup..."
docker exec $CONTAINER_NAME pg_dump -U neovolt -d neovolt > "$BACKUP_DIR/$BACKUP_FILE"

# Compress the backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Get backup file size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)

echo "✅ Database backup completed successfully!"
echo "📁 Backup file: $BACKUP_DIR/$BACKUP_FILE"
echo "📊 Backup size: $BACKUP_SIZE"

# Keep only last 7 days of backups
echo "🧹 Cleaning up old backups..."
find $BACKUP_DIR -name "neovolt_backup_*.sql.gz" -mtime +7 -delete

echo "🎉 Backup process completed!"