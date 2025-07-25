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
