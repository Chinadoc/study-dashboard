#!/bin/bash
# Batch upload curated infographics to R2
# Run from project root: ./scripts/upload_infographics_to_r2.sh

set -e

BUCKET="euro-keys-assets"
SOURCE_DIR="assets/key_reference/curated"

echo "Uploading curated infographics to R2..."

# Chevrolet Camaro images
echo "1/7: Uploading cupholder-slot..."
npx wrangler r2 object put $BUCKET/infographics/chevrolet/camaro/cupholder-slot.png --remote \
  --file=$SOURCE_DIR/chevrolet-camaro-cupholder-slot.png \
  --content-type=image/png

echo "2/7: Uploading button-variants..."
npx wrangler r2 object put $BUCKET/infographics/chevrolet/camaro/button-variants.png --remote \
  --file=$SOURCE_DIR/chevrolet-camaro-button-variants.png \
  --content-type=image/png

echo "3/7: Uploading hu100-reference..."
npx wrangler r2 object put $BUCKET/infographics/chevrolet/camaro/hu100-reference.png --remote \
  --file=$SOURCE_DIR/chevrolet-camaro-hu100-reference.png \
  --content-type=image/png

echo "4/7: Uploading hyq4ea-configs..."
npx wrangler r2 object put $BUCKET/infographics/chevrolet/camaro/hyq4ea-configs.png --remote \
  --file=$SOURCE_DIR/chevrolet-camaro-hyq4ea-configs.png \
  --content-type=image/png

echo "5/7: Uploading hyq4ea..."
npx wrangler r2 object put $BUCKET/infographics/chevrolet/camaro/hyq4ea.png --remote \
  --file=$SOURCE_DIR/chevrolet-camaro-hyq4ea.png \
  --content-type=image/png

# Generic images
echo "6/7: Uploading key-blank-hu100..."
npx wrangler r2 object put $BUCKET/infographics/generic/key-blank-hu100.png --remote \
  --file=$SOURCE_DIR/key-blank-hu100.png \
  --content-type=image/png

echo "7/7: Uploading battery-cr2032..."
npx wrangler r2 object put $BUCKET/infographics/generic/battery-cr2032.png --remote \
  --file=$SOURCE_DIR/battery-cr2032.png \
  --content-type=image/png

echo ""
echo "✅ All 7 curated infographics uploaded to R2!"
echo "R2 paths:"
echo "  - infographics/chevrolet/camaro/cupholder-slot.png"
echo "  - infographics/chevrolet/camaro/button-variants.png"
echo "  - infographics/chevrolet/camaro/hu100-reference.png"
echo "  - infographics/chevrolet/camaro/hyq4ea-configs.png"
echo "  - infographics/chevrolet/camaro/hyq4ea.png"
echo "  - infographics/generic/key-blank-hu100.png"
echo "  - infographics/generic/battery-cr2032.png"
