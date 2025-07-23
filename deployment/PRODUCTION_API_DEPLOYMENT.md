# 🚀 Production API Deployment

## 🎯 Current Issue:
- ✅ Frontend: vlzen.com (working)
- ❌ Backend API: Only localhost:8080
- ❌ Database: Only localhost

## 🚀 Solution: Deploy Backend to Production

### Option 1: Deploy to Same Server (Recommended)

**Step 1: Upload Backend Files**
Upload these files to your production server:
- `orchestrator/server.js`
- `orchestrator/package.json`
- `orchestrator/package-lock.json`
- `docker-compose.yaml` (for database)

**Step 2: Configure Production Environment**
Create `.env` file on production server:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=dataroom
PORT=8080
```

**Step 3: Install Dependencies**
```bash
cd /path/to/orchestrator
npm install
```

**Step 4: Start Backend Service**
```bash
node server.js
```

### Option 2: Use Reverse Proxy

**Configure nginx to proxy API calls:**
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

### Option 3: Cloud Deployment

**Deploy to cloud service:**
- AWS EC2
- Google Cloud Run
- Heroku
- DigitalOcean

## 🎯 Expected Result:
After deployment, these URLs should work:
- ✅ `https://vlzen.com/` (frontend)
- ✅ `https://vlzen.com/api/execute-blueprint` (backend)
- ✅ `https://vlzen.com/api/missions` (backend)

## 📋 Verification:
```bash
curl -X POST https://vlzen.com/api/execute-blueprint \
  -H "Content-Type: application/json" \
  -d '{"missionName": "Production Test", "blocks": []}'
```

Should return JSON response, not HTML. 