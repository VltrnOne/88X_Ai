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
