#!/bin/bash

echo "🔄 Rebuilding and restarting containers with image upload fixes..."

# Stop existing containers
echo "⏹️  Stopping existing containers..."
docker compose down

# Remove old images to force rebuild
echo "🗑️  Removing old images..."
docker compose down --rmi all

# Rebuild and start containers
echo "🔨 Rebuilding and starting containers..."
docker compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker compose ps

echo "✅ Rebuild complete! Your image upload functionality should now work."
echo "🌐 Frontend: http://localhost:650"
echo "🔧 Backend: http://localhost:3001"
echo "📊 Check logs with: docker compose logs -f"