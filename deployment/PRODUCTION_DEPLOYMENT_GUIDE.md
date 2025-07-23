# 🚀 VLTRN Production Deployment Guide

## 🎯 Complete Production Setup

### **Current Status:**
- ✅ **Frontend:** vlzen.com (deployed)
- ✅ **Backend API:** localhost:8080 (working)
- ✅ **Database:** localhost (working)
- ❌ **Production API:** Not deployed

## 🚀 Option 1: Full Production Deployment (Recommended)

### **Step 1: Deploy Backend to Production Server**

**Upload these files to your production server:**
```
orchestrator/
├── server.js
├── package.json
├── package-lock.json
└── .env (create with production settings)
```

**Create production .env file:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=dataroom
PORT=8080
```

**Install and start backend:**
```bash
cd orchestrator
npm install
node server.js
```

### **Step 2: Configure Web Server**

**For nginx, add this configuration:**
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
    }
}
```

## 🚀 Option 2: Temporary Local Development Setup

### **For immediate testing, use localhost:**

**Access the system at:**
- **Frontend:** http://localhost:5175
- **Backend API:** http://localhost:8080
- **Database:** localhost:5432

**Test the complete system:**
```bash
# Test API
curl -X POST http://localhost:8080/api/execute-blueprint \
  -H "Content-Type: application/json" \
  -d '{"missionName": "Test Mission", "blocks": []}'

# Test frontend
open http://localhost:5175
```

## 🎯 Option 3: Hybrid Setup (Current)

### **Use local backend with production frontend:**

**Update frontend to use local API:**
1. Set environment variable: `VITE_API_BASE_URL=http://localhost:8080`
2. Rebuild frontend: `npm run build`
3. Upload to vlzen.com
4. Access via: https://vlzen.com

**Note:** This requires the local backend to be running.

## ✅ Verification Checklist:

### **After deployment, test these URLs:**
- ✅ `https://vlzen.com/` (frontend loads)
- ✅ `https://vlzen.com/api/execute-blueprint` (API responds with JSON)
- ✅ `https://vlzen.com/api/missions` (API returns mission list)

### **Expected API Response:**
```json
{
  "message": "Blueprint accepted and mission initiated.",
  "missionId": 1,
  "planId": "mission-1234567890"
}
```

## 🎯 Recommended Next Steps:

1. **Deploy backend to production server** (Option 1)
2. **Configure reverse proxy** for API calls
3. **Test complete production system**
4. **Monitor logs and performance**

**The system is ready for production deployment!** 🚀 