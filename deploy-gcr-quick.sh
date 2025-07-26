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
