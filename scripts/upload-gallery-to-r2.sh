#!/bin/bash
# Upload gallery images to R2 bucket euro-keys-assets
# Images are uploaded with keys matching the manifest paths like:
# images/toyotalexus_smart_key_reference_guide/image1.png

BUCKET="euro-keys-assets"
SOURCE_DIR="gdrive_exports/images"

echo "Uploading images to R2 bucket: $BUCKET"
echo "Source directory: $SOURCE_DIR"

# Count total images
TOTAL=$(find "$SOURCE_DIR" -name "*.png" | wc -l)
echo "Total images to upload: $TOTAL"

# Upload each image
COUNT=0
for file in $(find "$SOURCE_DIR" -name "*.png"); do
    # Build R2 key: images/folder/imageX.png
    # Remove the "gdrive_exports/" prefix from the path
    R2_KEY="${file#gdrive_exports/}"
    
    COUNT=$((COUNT + 1))
    echo "[$COUNT/$TOTAL] Uploading: $R2_KEY"
    
    # Use wrangler r2 object put (requires being in api/ directory)
    npx wrangler r2 object put "$BUCKET/$R2_KEY" --file="$file" --content-type="image/png" --remote
    
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to upload $R2_KEY"
    fi
done

echo "Upload complete!"
