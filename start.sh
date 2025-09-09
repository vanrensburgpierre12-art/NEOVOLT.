#!/bin/bash

echo "🚀 Starting Neovolt E-commerce Store..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

echo "📦 Building and starting containers..."

# Build and start all services
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if backend is ready
echo "🔍 Checking backend health..."
for i in {1..30}; do
    if curl -s http://localhost:3001/api/health > /dev/null; then
        echo "✅ Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start. Check logs with: docker-compose logs backend"
        exit 1
    fi
    sleep 2
done

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T backend npm run migrate

# Check if frontend is ready
echo "🔍 Checking frontend..."
for i in {1..30}; do
    if curl -s http://localhost:650 > /dev/null; then
        echo "✅ Frontend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Frontend failed to start. Check logs with: docker-compose logs frontend"
        exit 1
    fi
    sleep 2
done

echo ""
echo "🎉 Neovolt is now running!"
echo ""
echo "📍 Access Points:"
echo "   Frontend: http://localhost:650"
echo "   Backend API: http://localhost:3001"
echo "   Database: localhost:5432"
echo ""
echo "🔧 Management Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart: docker-compose restart"
echo ""
echo "💡 Default Admin Account:"
echo "   Email: admin@neovolt.com"
echo "   Password: admin123"
echo ""
echo "🛒 Sample Products are pre-loaded for testing!"
echo ""
echo "Press Ctrl+C to stop all services"