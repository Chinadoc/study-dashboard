#!/bin/bash
# Batch upload gdrive_exports images to R2 with parallel processing
# Usage: ./batch_upload_r2.sh [CONCURRENT_JOBS]

CONCURRENT_JOBS=${1:-8}
BUCKET="euro-keys-assets"
SOURCE_DIR="/Users/jeremysamuels/Documents/study-dashboard/gdrive_exports/images"
R2_PREFIX="gdrive_exports/images"
LOG_FILE="/tmp/r2_upload_log.txt"

echo "Starting R2 batch upload with $CONCURRENT_JOBS concurrent jobs..."
echo "Source: $SOURCE_DIR"
echo "Destination: $BUCKET/$R2_PREFIX"
echo "---"

# Get list of all image files
find "$SOURCE_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" \) > /tmp/images_to_upload.txt

TOTAL=$(wc -l < /tmp/images_to_upload.txt | tr -d ' ')
echo "Found $TOTAL images to upload"
echo "---"

# Counter for progress
UPLOADED=0
FAILED=0

# Function to upload a single file
upload_file() {
    local file="$1"
    local relative_path="${file#$SOURCE_DIR/}"
    local r2_key="$R2_PREFIX/$relative_path"
    
    cd /Users/jeremysamuels/Documents/study-dashboard/api
    if wrangler r2 object put "$BUCKET/$r2_key" --file="$file" --remote 2>/dev/null; then
        echo "✓ $relative_path"
        return 0
    else
        echo "✗ FAILED: $relative_path" >> "$LOG_FILE"
        return 1
    fi
}

export -f upload_file
export SOURCE_DIR R2_PREFIX BUCKET LOG_FILE

# Clear previous log
> "$LOG_FILE"

# Run parallel uploads using xargs
echo ""
echo "Uploading with $CONCURRENT_JOBS parallel workers..."
cat /tmp/images_to_upload.txt | xargs -P $CONCURRENT_JOBS -I {} bash -c 'upload_file "$@"' _ {}

# Summary
echo ""
echo "=== Upload Complete ==="
if [ -s "$LOG_FILE" ]; then
    FAILED=$(wc -l < "$LOG_FILE" | tr -d ' ')
    echo "Failed uploads: $FAILED (see $LOG_FILE)"
else
    echo "All uploads successful!"
fi
