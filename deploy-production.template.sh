#!/bin/bash

echo "🚀 VLTRN Production Deployment Script"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yaml" ]; then
    echo "❌ Error: Please run this script from the vltrn-system root directory"
    exit 1
fi

echo "📁 Current directory: $(pwd)"

# TASK 1: Create production .env file
echo "🔧 Creating production environment file..."

cat << 'EOF' > .env
# Production Environment Variables

# Database Configuration (Google Cloud SQL)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_DB_PASSWORD
POSTGRES_DB=postgres
POSTGRES_HOST=YOUR_DB_PUBLIC_IP
POSTGRES_PORT=5432

# API Configuration
API_PORT=4000
API_HOST=0.0.0.0

# Enrichment & API Credentials
GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
SEARCH_ENGINE_ID=YOUR_SEARCH_ENGINE_ID
GITHUB_PAT=YOUR_GITHUB_PAT

# Redis Configuration
REDIS_URL=redis://redis:6379

# Agent Configuration
AGENT_TIMEOUT=300000
EOF

echo "✅ Created .env file template"
echo ""
echo "⚠️  IMPORTANT: Please edit the .env file and replace:"
echo "   - YOUR_DB_PASSWORD with your Google Cloud SQL password"
echo "   - YOUR_DB_PUBLIC_IP with your Google Cloud SQL public IP"
echo "   - YOUR_GOOGLE_API_KEY with your Google API key"
echo "   - YOUR_SEARCH_ENGINE_ID with your Search Engine ID"
echo "   - YOUR_GITHUB_PAT with your GitHub Personal Access Token"
echo ""
echo "Press Enter to continue after editing the .env file..."
read

# TASK 2: Pull latest Docker images
echo "🐳 Pulling latest Docker images from GitHub Container Registry..."
docker pull ghcr.io/vltrnone/intent-parser:latest
docker pull ghcr.io/vltrnone/scout-warn:latest
docker pull ghcr.io/vltrnone/marketer-agent:latest

echo "✅ Docker images pulled successfully"

# TASK 3: Launch the production stack
echo "🚀 Launching VLTRN production stack..."
docker-compose up --build -d

echo "✅ VLTRN production stack launched!"
echo ""
echo "📊 Check service status:"
echo "   docker-compose ps"
echo ""
echo "📋 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🌐 API Endpoint: http://your-server-ip:4000"
echo ""
echo "🎯 Next step: Deploy the frontend to a static hosting service" 