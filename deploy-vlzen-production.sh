#!/bin/bash

echo "🚀 VLTRN Production Deployment to vlzen.com"
echo "============================================"

# Check if we're in the right directory
if [ ! -f "docker-compose.yaml" ]; then
    echo "❌ Error: Please run this script from the vltrn-system root directory"
    exit 1
fi

echo "📁 Current directory: $(pwd)"

# Step 1: Build the frontend for production
echo "🔨 Building frontend for production..."
cd frontend/command-deck
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo "✅ Frontend built successfully"

# Step 2: Copy built files to deployment directory
echo "📁 Copying built files to deployment directory..."
cd ../..
cp -r frontend/command-deck/dist/* deployment/
echo "✅ Built files copied to deployment/"

# Step 3: Create production backend package
echo "📦 Creating production backend package..."
mkdir -p production-backend
cp production-backend/server.js production-backend/
cp production-backend/package.json production-backend/
cp production-backend/env.production production-backend/.env
echo "✅ Production backend package created"

# Step 4: Create deployment instructions for vlzen.com
echo "📋 Creating vlzen.com deployment instructions..."
cat << 'EOF' > VLZEN_DEPLOYMENT.md
# 🚀 VLTRN Production Deployment for vlzen.com

## 🔧 Current Issue:
The production site is returning HTML instead of JSON for API calls.
This script will fix the deployment.

## 📦 Deployment Packages Ready:

### **Frontend Package (deployment/ folder):**
- `index.html` - Production-ready HTML
- `assets/index-ZR2Rgvf3.js` - Frontend JavaScript
- `assets/index-Cyyab_dj.css` - Styled CSS
- `vite.svg` - Vite logo

### **Backend Package (production-backend/ folder):**
- `server.js` - Production API server with all endpoints
- `package.json` - Node.js dependencies
- `.env` - Environment configuration

## 🚀 Step-by-Step vlzen.com Deployment:

### **Step 1: Upload Files to Server**

**Upload via SSH/SCP:**
```bash
# Upload frontend files
scp -r deployment/* user@your-server:/var/www/html/

# Upload backend files
scp -r production-backend/* user@your-server:/var/www/vltrn-api/
```

### **Step 2: Configure Backend on Server**

**SSH into your server and run:**
```bash
# Navigate to backend directory
cd /var/www/vltrn-api

# Install dependencies
npm install --production

# Start with PM2 (if not already installed)
npm install -g pm2

# Stop existing service if running
pm2 stop vltrn-api 2>/dev/null || true
pm2 delete vltrn-api 2>/dev/null || true

# Start the new service
pm2 start server.js --name "vltrn-api"
pm2 save
pm2 startup
```

### **Step 3: Update Nginx Configuration**

**Edit nginx config:**
```bash
sudo nano /etc/nginx/sites-available/vlzen.com
```

**Replace with this configuration:**
```nginx
server {
    listen 80;
    server_name vlzen.com www.vlzen.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vlzen.com www.vlzen.com;
    
    # SSL configuration (your existing SSL setup)
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Frontend static files
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API proxy - THIS IS THE KEY FIX
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Handle CORS
        add_header Access-Control-Allow-Origin "https://vlzen.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://vlzen.com" always;
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Content-Type" always;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:8080/health;
        proxy_set_header Host $host;
    }
}
```

### **Step 4: Test and Reload Nginx**

```bash
# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

### **Step 5: Verify Deployment**

**Test the API endpoints:**
```bash
# Test intent parser
curl -X POST https://vlzen.com/api/parse-intent \
  -H "Content-Type: application/json" \
  -d '{"prompt":"find me recent layoffs in the tech industry"}'

# Test mission strategist
curl -X POST https://vlzen.com/api/generate-plan \
  -H "Content-Type: application/json" \
  -d '{"targetPersona":{"description":"test"},"rawPrompt":"test"}'

# Test health endpoint
curl https://vlzen.com/health
```

## ✅ Expected Results:

### **After deployment:**
- ✅ `https://vlzen.com/` - VLTRN interface loads
- ✅ `https://vlzen.com/api/parse-intent` - Returns JSON, not HTML
- ✅ `https://vlzen.com/api/generate-plan` - Returns JSON execution plan
- ✅ `https://vlzen.com/api/execute-plan` - Queues missions for execution
- ✅ `https://vlzen.com/api/missions` - Shows mission history

### **Frontend Features:**
- Mission Control interface
- Strategy generation
- Real-time mission tracking
- Proper styling and interactions

### **Backend Features:**
- Intent parsing with mock responses
- Plan generation
- Mission execution
- Mock responses for demo

## 🚀 Production Ready!

**The complete VLTRN autonomous acquisition platform will be live at https://vlzen.com!**

**Follow the steps above to deploy the updated version.**
EOF

echo "✅ vlzen.com deployment instructions created: VLZEN_DEPLOYMENT.md"

# Step 5: Create a quick deployment script
echo "📜 Creating quick deployment script..."
cat << 'EOF' > deploy-vlzen-quick.sh
#!/bin/bash

echo "🚀 Quick Deploy to vlzen.com"
echo "============================="

# Check if files exist
if [ ! -d "deployment" ]; then
    echo "❌ Error: deployment/ directory not found"
    exit 1
fi

if [ ! -d "production-backend" ]; then
    echo "❌ Error: production-backend/ directory not found"
    exit 1
fi

echo "📦 Deployment packages ready:"
echo "   - deployment/ (frontend files for /var/www/html/)"
echo "   - production-backend/ (API server for /var/www/vltrn-api/)"
echo ""
echo "📋 Deployment steps:"
echo "   1. Upload deployment/ to /var/www/html/"
echo "   2. Upload production-backend/ to /var/www/vltrn-api/"
echo "   3. Run: cd /var/www/vltrn-api && npm install --production"
echo "   4. Run: pm2 restart vltrn-api"
echo "   5. Run: sudo systemctl reload nginx"
echo ""
echo "🌐 Your VLTRN system will be live at https://vlzen.com"
echo ""
echo "📋 For detailed instructions, see: VLZEN_DEPLOYMENT.md"
EOF

chmod +x deploy-vlzen-quick.sh
echo "✅ Quick deployment script created: deploy-vlzen-quick.sh"

echo ""
echo "🎉 VLTRN vlzen.com Production Deployment Package Ready!"
echo "======================================================"
echo ""
echo "📦 Deployment packages created:"
echo "   ✅ deployment/ - Frontend files for /var/www/html/"
echo "   ✅ production-backend/ - API server for /var/www/vltrn-api/"
echo "   ✅ VLZEN_DEPLOYMENT.md - Complete vlzen.com deployment guide"
echo "   ✅ deploy-vlzen-quick.sh - Quick deployment script"
echo ""
echo "🚀 Next steps:"
echo "   1. Upload deployment/ folder to your web server"
echo "   2. Upload production-backend/ folder to your API server"
echo "   3. Follow the deployment guide in VLZEN_DEPLOYMENT.md"
echo "   4. Restart the API service and reload nginx"
echo ""
echo "🌐 Your VLTRN system will be live at https://vlzen.com"
echo ""
echo "📋 For detailed instructions, see: VLZEN_DEPLOYMENT.md" 