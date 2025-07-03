#!/bin/bash

# DevNotes Deployment Script
# This script helps prepare your app for Netlify deployment

echo "🚀 DevNotes Deployment Script"
echo "=============================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No remote repository found. Please add your remote:"
    echo "   git remote add origin <your-repo-url>"
    exit 1
fi

echo "✅ Git repository found"

# Check if netlify.toml exists
if [ ! -f "netlify.toml" ]; then
    echo "❌ netlify.toml not found. Creating it..."
    cat > netlify.toml << EOF
[build]
  publish = "public"
  command = ""

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
EOF
    echo "✅ Created netlify.toml"
fi

# Check if public directory exists
if [ ! -d "public" ]; then
    echo "❌ Public directory not found. Please ensure your frontend files are in the public/ directory."
    exit 1
fi

echo "✅ Public directory found"

# Check if script.js has API_BASE_URL configured
if ! grep -q "API_BASE_URL" public/script.js; then
    echo "⚠️  API_BASE_URL not found in script.js. Please update it with your backend URL after deployment."
fi

echo ""
echo "📋 Deployment Checklist:"
echo "========================"
echo "1. ✅ Git repository initialized"
echo "2. ✅ Remote repository configured"
echo "3. ✅ netlify.toml created"
echo "4. ✅ Public directory exists"
echo ""
echo "🚀 Ready to deploy!"
echo ""
echo "Next steps:"
echo "1. Push your code:"
echo "   git add ."
echo "   git commit -m 'Prepare for Netlify deployment'"
echo "   git push origin main"
echo ""
echo "2. Deploy to Netlify:"
echo "   - Go to https://netlify.com"
echo "   - Click 'New site from Git'"
echo "   - Connect your repository"
echo "   - Set publish directory to 'public'"
echo "   - Deploy!"
echo ""
echo "3. Deploy backend to Railway:"
echo "   - Go to https://railway.app"
echo "   - Create new project from your repo"
echo "   - Add MySQL plugin"
echo "   - Set environment variables"
echo "   - Update API_BASE_URL in script.js"
echo ""
echo "4. Update API URL:"
echo "   - After backend deployment, update API_BASE_URL in public/script.js"
echo "   - Redeploy frontend if needed"
echo ""
echo "🎉 Your DevNotes app will be live!" 