#!/bin/bash

echo "🚀 VLTRN Production Deployment to vlzen.com"
echo "============================================"

# Check if we're in the right directory
if [ ! -f "docker-compose.yaml" ]; then
    echo "❌ Error: Please run this script from the vltrn-system root directory"
    exit 1
fi

echo "📁 Current directory: $(pwd)"

# Step 1: Build the frontend
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

# Step 4: Create deployment instructions
echo "📋 Creating deployment instructions..."
cat << 'EOF' > DEPLOYMENT_INSTRUCTIONS.md
# 🚀 VLTRN Production Deployment Instructions

## 📦 Deployment Packages Ready:

### **Frontend Package (deployment/ folder):**
- `index.html` - Production-ready HTML
- `assets/index-ZR2Rgvf3.js` - Frontend JavaScript
- `assets/index-Cyyab_dj.css` - Styled CSS
- `vite.svg` - Vite logo

### **Backend Package (production-backend/ folder):**
- `server.js` - Production API server
- `package.json` - Node.js dependencies
- `.env` - Environment configuration

## 🚀 Step-by-Step Production Deployment:

### **Step 1: Deploy Backend API**

**Upload to your production server:**
```bash
# Upload production-backend/ folder to your server
# Example: /var/www/vltrn-api/
```

**Install and start backend:**
```bash
cd /var/www/vltrn-api
npm install --production
# The .env file is already configured

# Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "vltrn-api"
pm2 save
pm2 startup
```

### **Step 2: Configure Web Server**

**Add this nginx configuration:**
```nginx
server {
    listen 80;
    server_name vlzen.com;
    
    # Frontend static files
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **Step 3: Deploy Frontend**

**Upload deployment/ folder contents to:**
- `index.html` → `/var/www/html/`
- `assets/` folder → `/var/www/html/assets/`
- `vite.svg` → `/var/www/html/`

### **Step 4: Restart Web Server**
```bash
sudo systemctl reload nginx
# or
sudo service nginx reload
```

## ✅ Verification Tests:

### **Test 1: Frontend Loads**
```bash
curl https://vlzen.com
# Should return HTML with index-ZR2Rgvf3.js
```

### **Test 2: API Responds**
```bash
curl -X POST https://vlzen.com/api/parse-intent \
  -H "Content-Type: application/json" \
  -d '{"prompt":"find me recent layoffs in the tech industry"}'
# Should return JSON, not HTML
```

### **Test 3: Mission Generation**
```bash
curl -X POST https://vlzen.com/api/generate-plan \
  -H "Content-Type: application/json" \
  -d '{"targetPersona":{"description":"test"},"rawPrompt":"test"}'
# Should return JSON execution plan
```

## 🎯 Expected Results:

### **After deployment:**
- ✅ `https://vlzen.com/` - VLTRN interface loads
- ✅ `https://vlzen.com/api/parse-intent` - API accepts prompts
- ✅ `https://vlzen.com/api/generate-plan` - Generates execution plans
- ✅ `https://vlzen.com/api/execute-plan` - Queues missions for execution
- ✅ `https://vlzen.com/api/missions` - Shows mission history

### **Frontend Features:**
- Mission Control interface
- Strategy generation
- Real-time mission tracking
- Proper styling and interactions

### **Backend Features:**
- Intent parsing
- Plan generation
- Mission execution
- Mock responses for demo

## 🚀 Production Ready!

**The complete VLTRN autonomous acquisition platform will be live at https://vlzen.com!**

**Upload the files and configure the web server as described above.**
EOF

echo "✅ Deployment instructions created: DEPLOYMENT_INSTRUCTIONS.md"

# Step 5: Create a simple deployment script
echo "📜 Creating deployment script..."
cat << 'EOF' > deploy.sh
#!/bin/bash

echo "🚀 Quick Deploy Script for vlzen.com"
echo "====================================="

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
echo "   - deployment/ (frontend files)"
echo "   - production-backend/ (API server)"
echo ""
echo "📋 Next steps:"
echo "   1. Upload deployment/ to /var/www/html/"
echo "   2. Upload production-backend/ to /var/www/vltrn-api/"
echo "   3. Configure nginx (see DEPLOYMENT_INSTRUCTIONS.md)"
echo "   4. Start the API server with PM2"
echo ""
echo "🌐 Your VLTRN system will be live at https://vlzen.com"
EOF

chmod +x deploy.sh
echo "✅ Deployment script created: deploy.sh"

echo ""
echo "🎉 VLTRN Production Deployment Package Ready!"
echo "============================================"
echo ""
echo "📦 Deployment packages created:"
echo "   ✅ deployment/ - Frontend files for /var/www/html/"
echo "   ✅ production-backend/ - API server for /var/www/vltrn-api/"
echo "   ✅ DEPLOYMENT_INSTRUCTIONS.md - Complete deployment guide"
echo "   ✅ deploy.sh - Quick deployment script"
echo ""
echo "🚀 Next steps:"
echo "   1. Upload deployment/ folder to your web server"
echo "   2. Upload production-backend/ folder to your API server"
echo "   3. Configure nginx as described in DEPLOYMENT_INSTRUCTIONS.md"
echo "   4. Start the API server with PM2"
echo ""
echo "🌐 Your VLTRN system will be live at https://vlzen.com"
echo ""
echo "📋 For detailed instructions, see: DEPLOYMENT_INSTRUCTIONS.md" 