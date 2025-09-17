#!/bin/bash

# Neovolt Production Deployment Script
set -e

echo "🚀 Starting Neovolt Production Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.production to .env and configure your environment variables."
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
required_vars=("DB_PASSWORD" "JWT_SECRET" "ADMIN_PASSWORD" "PAYPAL_CLIENT_ID" "PAYPAL_CLIENT_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set!"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Create SSL directory if it doesn't exist
mkdir -p nginx/ssl

# Check if SSL certificates exist
if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
    echo "⚠️  Warning: SSL certificates not found!"
    echo "Please place your SSL certificates in nginx/ssl/ directory:"
    echo "  - nginx/ssl/cert.pem (certificate file)"
    echo "  - nginx/ssl/key.pem (private key file)"
    echo ""
    echo "For development, you can generate self-signed certificates:"
    echo "  openssl req -x509 -newkey rsa:4096 -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365 -nodes"
    echo ""
    read -p "Do you want to continue without SSL certificates? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."

# Check backend health
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Check frontend
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Service URLs:"
echo "  Frontend: http://localhost:80"
echo "  Backend API: http://localhost:3001"
echo "  Health Check: http://localhost:3001/api/health"
echo ""
echo "🔐 Admin Credentials:"
echo "  Email: admin@neovolt.com"
echo "  Password: Check your ADMIN_PASSWORD environment variable"
echo ""
echo "📊 To view logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 To stop services:"
echo "  docker-compose -f docker-compose.prod.yml down"