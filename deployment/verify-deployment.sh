#!/bin/bash

echo "🔍 VLTRN Deployment Verification Script"
echo "======================================"

# Check if the main page loads
echo "📄 Checking main page..."
if curl -s https://vlzen.com | grep -q "index-DWhPCfRs.js"; then
    echo "✅ index.html has correct JavaScript reference"
else
    echo "❌ index.html has incorrect JavaScript reference"
fi

# Check if JavaScript file exists
echo "📦 Checking JavaScript file..."
if curl -s -I https://vlzen.com/assets/index-DWhPCfRs.js | grep -q "200"; then
    echo "✅ JavaScript file is accessible"
else
    echo "❌ JavaScript file not found"
fi

# Check if CSS file exists
echo "🎨 Checking CSS file..."
if curl -s -I https://vlzen.com/assets/index-Cyyab_dj.css | grep -q "200"; then
    echo "✅ CSS file is accessible"
else
    echo "❌ CSS file not found"
fi

# Check for old files
echo "🧹 Checking for old files..."
if curl -s -I https://vlzen.com/assets/index-rajwW3gj.js | grep -q "200"; then
    echo "⚠️  Old JavaScript file still exists"
else
    echo "✅ Old JavaScript file removed"
fi

echo ""
echo "🎯 Deployment Status Summary:"
echo "If all checks show ✅, the deployment was successful!"
echo "If you see ❌, you need to upload the files again."
echo ""
echo "🌐 Visit: https://vlzen.com"
echo "🔄 Hard refresh: Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)" 