#!/bin/bash

# Euro Keys Deployment Script
# Syncs all necessary files to dist/ for Cloudflare Pages deployment

echo "🚀 Starting build/sync process..."

# Ensure dist directory exists
mkdir -p dist

# Generate valid timestamp for cache busting
TIMESTAMP=$(date +%s)

# 1. Copy Key Config Files
echo "📄 Copying configuration files..."
cp _headers dist/
cp _redirects dist/
cp _routes.json dist/
cp manifest.json dist/
cp sw.js dist/

# 2. Process Root HTML (Add Cache Busting) & Copy
echo "🔄 Injecting cache buster into Root index.html: v=$TIMESTAMP"

# Update ROOT index.html in-place
# Note: This modifies the source file to ensure consistency
sed -i '' "s/\.js?v=[0-9]*\"/.js?v=$TIMESTAMP\"/g" index.html
sed -i '' "s/\.css?v=[0-9]*\"/.css?v=$TIMESTAMP\"/g" index.html
# Fallback for first run (if no v= exists yet)
sed -i '' "s/\.js\"/.js?v=$TIMESTAMP\"/g" index.html
sed -i '' "s/\.css\"/.css?v=$TIMESTAMP\"/g" index.html

echo "📄 Copying updated index.html to dist/..."
cp index.html dist/
cp structured_guides.json dist/ 2>/dev/null || :
cp asin_based_affiliate_products.json dist/ 2>/dev/null || :

# 3. Sync Directories (using rsync for efficiency if available, else cp -r)
echo "📂 Syncing directories..."

# Function to clean and copy directory
sync_dir() {
    src=$1
    dest="dist/$1"
    
    echo "  - Syncing $src to $dest..."
    # Remove existing dest dir to ensure no stale files (optional, but safer)
    rm -rf "$dest"
    
    # Copy new content
    cp -R "$src" "$dest"
}

sync_dir "js"
sync_dir "css"
sync_dir "images"
sync_dir "public"
sync_dir "assets"
sync_dir "components"
sync_dir "functions"

echo "✅ Build complete! 'dist/' is ready for deployment."
echo "👉 Run: git add dist/ && git commit -m 'Deploy: Sync via deploy.sh' && git push"
