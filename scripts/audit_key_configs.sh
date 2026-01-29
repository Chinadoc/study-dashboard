#!/bin/bash
# Audit all vehicle key configurations to find problematic keyTypes

MAKES=("Acura" "Audi" "BMW" "Buick" "Cadillac" "Chevrolet" "Chrysler" "Dodge" "Ford" "GMC" "Genesis" "Honda" "Hyundai" "Infiniti" "Jaguar" "Jeep" "Kia" "Land Rover" "Lexus" "Lincoln" "Mazda" "Mercedes" "Mini" "Mitsubishi" "Nissan" "Porsche" "RAM" "Subaru" "Tesla" "Toyota" "Volkswagen" "Volvo")

API_BASE="https://euro-keys.jeremy-samuels17.workers.dev"

echo "{"
echo "  \"auditResults\": {"

first_make=true
for make in "${MAKES[@]}"; do
  # Get first model for this make
  model=$(curl -s "$API_BASE/api/vyp/models?make=$(echo $make | sed 's/ /%20/g')" 2>/dev/null | jq -r 'if .models then .models[0] else null end' 2>/dev/null)
  
  if [ "$model" != "null" ] && [ -n "$model" ]; then
    # Get years for this model
    years=$(curl -s "$API_BASE/api/vyp/years-for-model?make=$(echo $make | sed 's/ /%20/g')&model=$(echo $model | sed 's/ /%20/g')" 2>/dev/null | jq -r 'if .years then [.years[0], .years[-1]] | @csv else "2018,2022" end' 2>/dev/null | tr -d '"')
    
    IFS=',' read -r year1 year2 <<< "$years"
    
    # Get aks_key_configs for year1
    keyTypes=$(curl -s "$API_BASE/api/vehicle-detail?make=$(echo $make | sed 's/ /%20/g')&model=$(echo $model | sed 's/ /%20/g')&year=$year1" 2>/dev/null | jq -c '[.aks_key_configs[]?.keyType] | unique' 2>/dev/null)
    
    if [ "$first_make" = true ]; then
      first_make=false
    else
      echo ","
    fi
    
    echo "    \"$make\": {"
    echo "      \"model\": \"$model\","
    echo "      \"year\": $year1,"
    echo "      \"keyTypes\": $keyTypes"
    echo -n "    }"
  fi
done

echo ""
echo "  }"
echo "}"
