#!/bin/bash

echo "🚀 VLTRN System Deployment Script"
echo "=================================="

# Create VLTRN directory
mkdir -p ~/vltrn-system
cd ~/vltrn-system

echo "📁 Created VLTRN directory"

# Download production docker-compose file
curl -o docker-compose.yaml https://raw.githubusercontent.com/VltrnOne/vltrn-system/main/docker-compose.prod.yaml

echo "📥 Downloaded production docker-compose file"

# Create database initialization script
mkdir -p dataroom-db
cat > dataroom-db/init-db.sh << 'EOF'
#!/bin/bash
set -e

echo "Starting database initialization..."

# Create postgres role and database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create postgres role if it doesn't exist
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
            CREATE ROLE postgres WITH LOGIN PASSWORD 'postgres';
        END IF;
    END
    \$\$;
    
    -- Grant necessary permissions to postgres role
    ALTER ROLE postgres CREATEDB;
    ALTER ROLE postgres SUPERUSER;
EOSQL

echo "Created postgres role with proper permissions"

# Create tables in dataroom database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "dataroom" <<-EOSQL
    -- Create warn_notices table
    CREATE TABLE IF NOT EXISTS warn_notices (
      id SERIAL PRIMARY KEY,
      received_date DATE,
      company_name VARCHAR(255) NOT NULL,
      employee_count INT,
      UNIQUE (company_name, received_date, employee_count)
    );
    
    -- Create missions table with all required columns
    CREATE TABLE IF NOT EXISTS missions (
      id SERIAL PRIMARY KEY,
      prompt TEXT,
      parsed_intent JSONB,
      mission_plan JSONB,
      status VARCHAR(50) DEFAULT 'queued',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP WITH TIME ZONE
    );
    
    -- Create mission_results table
    CREATE TABLE IF NOT EXISTS mission_results (
      id SERIAL PRIMARY KEY,
      mission_id INT REFERENCES missions(id) ON DELETE CASCADE,
      agent_name VARCHAR(100),
      contact_name VARCHAR(255),
      contact_email VARCHAR(255) UNIQUE,
      source TEXT,
      enriched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Grant permissions to postgres role
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE dataroom TO postgres;
EOSQL

echo "Database initialization completed successfully"
EOF

chmod +x dataroom-db/init-db.sh

echo "📝 Created database initialization script"

# Pull Docker images
echo "🐳 Pulling Docker images from GitHub Container Registry..."
docker pull ghcr.io/vltrnone/intent-parser:latest
docker pull ghcr.io/vltrnone/scout-warn:latest
docker pull ghcr.io/vltrnone/marketer-agent:latest

echo "✅ Docker images pulled successfully"

# Start the services
echo "🚀 Starting VLTRN services..."
docker-compose up -d

echo "✅ VLTRN System deployed successfully!"
echo ""
echo "🌐 API Endpoint: http://your-server-ip:4000"
echo "📊 Check status: docker-compose ps"
echo "📋 View logs: docker-compose logs -f"
echo ""
echo "🎯 Next step: Deploy the frontend to a static hosting service" 