#!/bin/bash
# Batch upload all AKS product images to R2
# Usage: ./batch_upload_aks_to_r2.sh

set -e

AKS_IMAGES_DIR="/Users/jeremysamuels/Documents/study-dashboard/data/scraped_sources/american_key_supply/images"
BUCKET="euro-keys-assets"
R2_PREFIX="aks_products"
API_DIR="/Users/jeremysamuels/Documents/study-dashboard/api"
CONCURRENCY=32

cd "$API_DIR"

echo "Starting batch upload of AKS images to R2..."
echo "Source: $AKS_IMAGES_DIR"
echo "Destination: $BUCKET/$R2_PREFIX/"
echo "Concurrency: $CONCURRENCY"
echo ""

# Count total images
TOTAL=$(find "$AKS_IMAGES_DIR" -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" \) | wc -l | tr -d ' ')
echo "Total images to upload: $TOTAL"
echo ""

# Create upload function
upload_image() {
    local src="$1"
    local filename=$(basename "$src")
    local r2_key="$R2_PREFIX/$filename"
    
    # Determine content type
    case "${filename##*.}" in
        jpg|jpeg) content_type="image/jpeg" ;;
        png) content_type="image/png" ;;
        *) content_type="application/octet-stream" ;;
    esac
    
    wrangler r2 object put "$BUCKET/$r2_key" --file="$src" --content-type="$content_type" --remote 2>/dev/null
    echo "✓ $filename"
}

export -f upload_image
export BUCKET R2_PREFIX

# Execute parallel uploads
find "$AKS_IMAGES_DIR" -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" \) | \
    xargs -P $CONCURRENCY -I {} bash -c 'upload_image "$@"' _ {}

echo ""
echo "✅ Batch upload complete!"
