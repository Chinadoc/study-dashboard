#!/bin/bash
# Upload vehicle thumbnails to R2 using wrangler CLI

SOURCE_DIR="$1"
BUCKET="euro-keys-assets"

if [ -z "$SOURCE_DIR" ]; then
    echo "Usage: ./upload_vehicle_thumbnails.sh /path/to/images"
    exit 1
fi

if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Directory not found: $SOURCE_DIR"
    exit 1
fi

echo "=== Uploading Vehicle Thumbnails ==="
echo "Source: $SOURCE_DIR"
echo "Bucket: $BUCKET"
echo ""

# Count files
total=$(ls -1 "$SOURCE_DIR"/*.png 2>/dev/null | wc -l | tr -d ' ')
echo "Found $total PNG files"

success=0
failed=0

# Process each PNG file
for file in "$SOURCE_DIR"/*.png; do
    [ -e "$file" ] || continue
    
    filename=$(basename "$file")
    
    # Parse make and model from filename
    # Remove timestamp suffix like _1769919858282
    base=$(echo "$filename" | sed -E 's/_[0-9]{13}\.png$/.png/')
    base="${base%.png}"
    
    # Determine make from prefix
    case "$base" in
        acura_*) make="acura"; model="${base#acura_}" ;;
        alfa_romeo_*) make="alfa-romeo"; model="${base#alfa_romeo_}" ;;
        aston_martin_*) make="aston-martin"; model="${base#aston_martin_}" ;;
        audi_*) make="audi"; model="${base#audi_}" ;;
        bentley_*) make="bentley"; model="${base#bentley_}" ;;
        bmw_*) make="bmw"; model="${base#bmw_}" ;;
        buick_*) make="buick"; model="${base#buick_}" ;;
        cadillac_*) make="cadillac"; model="${base#cadillac_}" ;;
        chevrolet_*) make="chevrolet"; model="${base#chevrolet_}" ;;
        chrysler_*) make="chrysler"; model="${base#chrysler_}" ;;
        dodge_*) make="dodge"; model="${base#dodge_}" ;;
        ferrari_*) make="ferrari"; model="${base#ferrari_}" ;;
        fiat_*) make="fiat"; model="${base#fiat_}" ;;
        ford_*) make="ford"; model="${base#ford_}" ;;
        genesis_*) make="genesis"; model="${base#genesis_}" ;;
        gmc_*) make="gmc"; model="${base#gmc_}" ;;
        honda_*) make="honda"; model="${base#honda_}" ;;
        hyundai_*) make="hyundai"; model="${base#hyundai_}" ;;
        infiniti_*) make="infiniti"; model="${base#infiniti_}" ;;
        jaguar_*) make="jaguar"; model="${base#jaguar_}" ;;
        jeep_*) make="jeep"; model="${base#jeep_}" ;;
        kia_*) make="kia"; model="${base#kia_}" ;;
        lamborghini_*) make="lamborghini"; model="${base#lamborghini_}" ;;
        land_rover_*) make="land-rover"; model="${base#land_rover_}" ;;
        lexus_*) make="lexus"; model="${base#lexus_}" ;;
        lincoln_*) make="lincoln"; model="${base#lincoln_}" ;;
        lucid_*) make="lucid"; model="${base#lucid_}" ;;
        maserati_*) make="maserati"; model="${base#maserati_}" ;;
        mazda_*) make="mazda"; model="${base#mazda_}" ;;
        mclaren_*) make="mclaren"; model="${base#mclaren_}" ;;
        mercedes_*) make="mercedes"; model="${base#mercedes_}" ;;
        mini_*) make="mini"; model="${base#mini_}" ;;
        mitsubishi_*) make="mitsubishi"; model="${base#mitsubishi_}" ;;
        nissan_*) make="nissan"; model="${base#nissan_}" ;;
        polestar_*) make="polestar"; model="${base#polestar_}" ;;
        porsche_*) make="porsche"; model="${base#porsche_}" ;;
        ram_*) make="ram"; model="${base#ram_}" ;;
        rivian_*) make="rivian"; model="${base#rivian_}" ;;
        rolls_royce_*) make="rolls-royce"; model="${base#rolls_royce_}" ;;
        subaru_*) make="subaru"; model="${base#subaru_}" ;;
        tesla_*) make="tesla"; model="${base#tesla_}" ;;
        toyota_*) make="toyota"; model="${base#toyota_}" ;;
        volkswagen_*) make="volkswagen"; model="${base#volkswagen_}" ;;
        volvo_*) make="volvo"; model="${base#volvo_}" ;;
        *) 
            # Skip files that don't match any known make
            echo "⊘ Skipped (unknown make): $filename"
            continue
            ;;
    esac
    
    # Convert underscores to hyphens in model
    model=$(echo "$model" | tr '_' '-')
    
    # R2 key
    r2_key="vehicles/${make}/${model}.png"
    
    # Upload using wrangler
    if wrangler r2 object put "${BUCKET}/${r2_key}" --file "$file" --content-type "image/png" > /dev/null 2>&1; then
        echo "✓ $r2_key"
        ((success++))
    else
        echo "✗ Failed: $r2_key"
        ((failed++))
    fi
    
    # Progress indicator every 20 files
    count=$((success + failed))
    if [ $((count % 20)) -eq 0 ]; then
        echo "Progress: $count/$total"
    fi
done

echo ""
echo "=== Upload Complete ==="
echo "Success: $success"
echo "Failed: $failed"
echo "Total: $total"
