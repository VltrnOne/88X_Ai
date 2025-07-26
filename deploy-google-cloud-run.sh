#!/bin/bash

echo "🚀 VLTRN Google Cloud Run Deployment"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yaml" ]; then
    echo "❌ Error: Please run this script from the vltrn-system root directory"
    exit 1
fi

echo "📁 Current directory: $(pwd)"

# Configuration
PROJECT_ID="your-google-cloud-project-id"
REGION="us-central1"
SERVICE_NAME="vltrn-api"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🔧 Configuration:"
echo "   Project ID: $PROJECT_ID"
echo "   Region: $REGION"
echo "   Service Name: $SERVICE_NAME"
echo "   Image Name: $IMAGE_NAME"
echo ""

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

# Step 3: Create Google Cloud Run deployment instructions
echo "📋 Creating Google Cloud Run deployment guide..."
cat << 'EOF' > GOOGLE_CLOUD_RUN_DEPLOYMENT.md
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
EOF

echo "✅ Google Cloud Run deployment guide created: GOOGLE_CLOUD_RUN_DEPLOYMENT.md"

# Step 4: Create a quick deployment script
echo "📜 Creating quick Google Cloud Run deployment script..."
cat << 'EOF' > deploy-gcr-quick.sh
#!/bin/bash

echo "🚀 Quick Google Cloud Run Deploy"
echo "================================"

# Configuration
PROJECT_ID="your-google-cloud-project-id"
REGION="us-central1"
SERVICE_NAME="vltrn-api"

echo "📦 Deployment packages ready:"
echo "   - production-backend/ (Docker container for Cloud Run)"
echo "   - deployment/ (frontend files for SiteGround)"
echo ""
echo "📋 Quick deployment steps:"
echo "   1. Update PROJECT_ID in this script"
echo "   2. Run: gcloud auth login"
echo "   3. Run: gcloud config set project YOUR_PROJECT_ID"
echo "   4. Run: cd production-backend && docker build -t gcr.io/YOUR_PROJECT_ID/vltrn-api ."
echo "   5. Run: docker push gcr.io/YOUR_PROJECT_ID/vltrn-api"
echo "   6. Run: gcloud run deploy vltrn-api --image gcr.io/YOUR_PROJECT_ID/vltrn-api --platform managed --region us-central1 --allow-unauthenticated"
echo "   7. Upload deployment/ to SiteGround"
echo ""
echo "🌐 Your VLTRN system will be live at:"
echo "   Frontend: https://vlzen.com"
echo "   Backend: https://vltrn-api-xxxxx-uc.a.run.app"
EOF

chmod +x deploy-gcr-quick.sh
echo "✅ Quick deployment script created: deploy-gcr-quick.sh"

echo ""
echo "🎉 VLTRN Google Cloud Run Deployment Package Ready!"
echo "=================================================="
echo ""
echo "📦 Deployment packages created:"
echo "   ✅ production-backend/ - Containerized backend for Cloud Run"
echo "   ✅ deployment/ - Frontend files for SiteGround"
echo "   ✅ GOOGLE_CLOUD_RUN_DEPLOYMENT.md - Complete Cloud Run guide"
echo "   ✅ deploy-gcr-quick.sh - Quick deployment script"
echo ""
echo "🚀 Next steps:"
echo "   1. Set up Google Cloud project"
echo "   2. Build and deploy container to Cloud Run"
echo "   3. Update frontend to use Cloud Run API"
echo "   4. Deploy frontend to SiteGround"
echo ""
echo "🌐 Your VLTRN system will be live with:"
echo "   Frontend: https://vlzen.com (SiteGround)"
echo "   Backend: https://vltrn-api-xxxxx-uc.a.run.app (Google Cloud Run)"
echo ""
echo "📋 For detailed instructions, see: GOOGLE_CLOUD_RUN_DEPLOYMENT.md" 