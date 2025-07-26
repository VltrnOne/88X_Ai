# 🚀 VLTRN Google Cloud Run Deployment Guide

## 📦 Deployment Strategy

### **Frontend:** SiteGround (vlzen.com)
- Static files served from SiteGround
- Updated to call Google Cloud Run API

### **Backend:** Google Cloud Run
- Containerized Node.js service
- Auto-scaling, HTTPS, domain mapping
- Unified API endpoints

## 🚀 Step-by-Step Deployment:

### **Step 1: Set Up Google Cloud**

```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Authenticate
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID
```

### **Step 2: Enable Required APIs**

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Artifact Registry API
gcloud services enable artifactregistry.googleapis.com
```

### **Step 3: Build and Deploy Backend**

```bash
# Navigate to production backend
cd production-backend

# Build Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/vltrn-api .

# Push to Google Artifact Registry
docker push gcr.io/YOUR_PROJECT_ID/vltrn-api

# Deploy to Cloud Run
gcloud run deploy vltrn-api \
  --image gcr.io/YOUR_PROJECT_ID/vltrn-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars NODE_ENV=production,MOCK_ENABLED=true
```

### **Step 4: Update Frontend Configuration**

**Update the frontend API calls to use the Cloud Run URL:**

```javascript
// In frontend/command-deck/src/components/VLTRNCanvas.jsx
const apiClient = {
  post: async (path, body) => {
    // Use Google Cloud Run URL
    const baseUrl = 'https://vltrn-api-xxxxx-uc.a.run.app';
    
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return response.json();
  }
};
```

### **Step 5: Deploy Frontend to SiteGround**

**Upload deployment/ folder to SiteGround:**
- `index.html` → `/public_html/`
- `assets/` folder → `/public_html/assets/`
- `vite.svg` → `/public_html/`

### **Step 6: Configure Custom Domain (Optional)**

```bash
# Map custom domain to Cloud Run
gcloud run domain-mappings create \
  --service vltrn-api \
  --domain api.vlzen.com \
  --region us-central1
```

## ✅ Expected Results:

### **After deployment:**
- ✅ `https://vlzen.com/` - VLTRN interface loads
- ✅ `https://vltrn-api-xxxxx-uc.a.run.app/api/parse-intent` - Returns JSON
- ✅ `https://vltrn-api-xxxxx-uc.a.run.app/api/generate-plan` - Returns JSON
- ✅ No more "Unexpected token '<'" errors
- ✅ Auto-scaling backend service
- ✅ HTTPS and security handled by Google Cloud

### **Benefits of Google Cloud Run:**
- ✅ Auto-scaling (0 to 1000+ instances)
- ✅ Pay only for actual usage
- ✅ Built-in HTTPS and security
- ✅ Global CDN and edge locations
- ✅ Easy deployment and updates
- ✅ No server management required

## 🚀 Production Ready!

**The complete VLTRN autonomous acquisition platform will be live with:**
- **Frontend:** https://vlzen.com (SiteGround)
- **Backend:** https://vltrn-api-xxxxx-uc.a.run.app (Google Cloud Run)

**Follow the steps above to deploy the containerized backend to Google Cloud Run.**
