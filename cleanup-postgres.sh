#!/bin/bash

echo "Cleaning up PostgreSQL data volume..."
echo "This will remove all existing PostgreSQL data. Are you sure? (y/N)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "Stopping containers..."
    docker-compose down
    
    echo "Removing PostgreSQL volume..."
    docker volume rm neovolt_postgres_data 2>/dev/null || echo "Volume not found or already removed"
    
    echo "Cleanup completed. You can now run 'docker-compose up' to start fresh."
else
    echo "Cleanup cancelled."
fi