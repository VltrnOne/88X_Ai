# 🚀 Production Backend Deployment

## 📦 Files to Upload to Production Server:

### **Core Backend Files:**
- `server.js` - Main orchestrator server
- `package.json` - Node.js dependencies
- `package-lock.json` - Locked dependency versions
- `env.production` - Production environment variables

### **Deployment Steps:**

#### **Step 1: Upload to Production Server**
1. Upload all files in `production-backend/` to your server
2. Place them in a directory like `/var/www/vltrn-api/`

#### **Step 2: Install Dependencies**
```bash
cd /var/www/vltrn-api
npm install --production
```

#### **Step 3: Set Environment Variables**
```bash
cp env.production .env
# Edit .env with your production database settings
```

#### **Step 4: Start the Backend Service**
```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "vltrn-api"

# Or using systemd
sudo systemctl enable vltrn-api
sudo systemctl start vltrn-api
```

#### **Step 5: Configure Web Server**

**For nginx, add this to your server block:**
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

#### **Step 6: Update Frontend API Base URL**
Update the frontend to use the production API:
```javascript
// In frontend/command-deck/src/config.js
export const API_BASE_URL = 'https://vlzen.com';
```

## ✅ Verification:

After deployment, test:
```bash
curl -X POST https://vlzen.com/api/execute-blueprint \
  -H "Content-Type: application/json" \
  -d '{"missionName": "Production Test", "blocks": []}'
```

Should return JSON, not HTML.

## 🎯 Expected Result:
- ✅ `https://vlzen.com/` (frontend)
- ✅ `https://vlzen.com/api/execute-blueprint` (backend API)
- ✅ `https://vlzen.com/api/missions` (mission list) 