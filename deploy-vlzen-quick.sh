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
