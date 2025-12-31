#!/bin/bash

# Euro Keys Deployment Script
# Syncs all necessary files to dist/ for Cloudflare Pages deployment

echo "🚀 Starting build/sync process..."

# Ensure dist directory exists
mkdir -p dist

# 1. Copy Key Config Files
echo "📄 Copying configuration files..."
cp _headers dist/
cp _redirects dist/
cp _routes.json dist/
cp manifest.json dist/
cp sw.js dist/

# 2. Copy and Process Main HTML (Add Cache Busting)
echo "📄 Copying and processing index.html..."
cp index.html dist/

# Generate valid timestamp
TIMESTAMP=$(date +%s)
echo "🔄 Injecting cache buster: v=$TIMESTAMP"

# Use simple sed to append version to .js" and .css" checks
# Note: macOS sed requires empty string for -i
sed -i '' "s/\.js\"/.js?v=$TIMESTAMP\"/g" dist/index.html
sed -i '' "s/\.css\"/.css?v=$TIMESTAMP\"/g" dist/index.html

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
