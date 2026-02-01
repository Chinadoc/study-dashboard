#!/bin/bash

# Comment System Stress Test Script
# Creates ~200 test comments across different vehicles and scenarios

API_URL="http://localhost:8787"
TEST_HEADER="X-Test-Mode: true"

# Sample vehicles to test
VEHICLES=(
  "Chevrolet,Camaro"
  "Ford,Mustang"
  "Toyota,Camry"
  "Honda,Accord"
  "BMW,3-Series"
  "Mercedes-Benz,C-Class"
  "Audi,A4"
  "Lexus,ES"
  "Porsche,911"
  "Tesla,Model-3"
)

# Sample comment contents
COMMENTS=(
  "Great tip for programming this vehicle!"
  "Used Autel IM608 for this - worked perfectly"
  "LISHI tool makes decoding easy on this model"
  "Be careful with the battery disconnect on this one"
  "AKL procedure requires special adapter"
  "SmartPro works great for these keys"
  "Had issues with the CAN bus on this vehicle"
  "PIN extraction through OBD was straightforward"
  "Remote programming took about 10 minutes"
  "Watch out for anti-theft module interference"
  "Used VVDI Key Tool for this successfully"
  "Required dealer mode for full functionality"
  "EEprom read was necessary for this job"
  "Transponder cloning worked on first try"
  "Had to replace ignition cylinder too"
  "Customer lost all keys - full AKL job"
  "Proximity key programming was tricky"
  "Push-to-start system added complexity"
  "Used Xhorse VVDI2 for this make"
  "Make sure to check blade type first"
)

JOB_TYPES=("AKL" "Duplicate" "Remote" "Prox" "EEprom")
TOOLS=("Autel IM608" "SmartPro" "VVDI Key Tool" "Xhorse VVDI2" "SBB Pro2" "LISHI 2in1")

echo "Starting comment stress test..."
echo "================================"

TOTAL=0
SUCCESS=0
FAILED=0
PARENT_IDS=()

# Phase 1: Create top-level comments (about 100)
echo ""
echo "Phase 1: Creating 100 top-level comments..."
for i in {1..100}; do
  # Pick random vehicle
  VEHICLE=${VEHICLES[$((RANDOM % ${#VEHICLES[@]}))]}
  IFS=',' read -r MAKE MODEL <<< "$VEHICLE"
  
  # Pick random content
  CONTENT="${COMMENTS[$((RANDOM % ${#COMMENTS[@]}))]}"
  
  # Sometimes add job_type and tool_used
  JOB_TYPE=""
  TOOL=""
  if [ $((RANDOM % 2)) -eq 0 ]; then
    JOB_TYPE="${JOB_TYPES[$((RANDOM % ${#JOB_TYPES[@]}))]}"
    TOOL="${TOOLS[$((RANDOM % ${#TOOLS[@]}))]}"
  fi
  
  # Build JSON payload
  if [ -n "$JOB_TYPE" ]; then
    PAYLOAD="{\"make\":\"$MAKE\",\"model\":\"$MODEL\",\"content\":\"$CONTENT #$i\",\"job_type\":\"$JOB_TYPE\",\"tool_used\":\"$TOOL\"}"
  else
    PAYLOAD="{\"make\":\"$MAKE\",\"model\":\"$MODEL\",\"content\":\"$CONTENT #$i\"}"
  fi
  
  RESPONSE=$(curl -s -X POST "$API_URL/api/vehicle-comments" \
    -H "Content-Type: application/json" \
    -H "$TEST_HEADER" \
    -d "$PAYLOAD")
  
  ((TOTAL++))
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    ((SUCCESS++))
    # Extract comment_id for threading
    COMMENT_ID=$(echo "$RESPONSE" | grep -o '"comment_id":"[^"]*"' | cut -d'"' -f4)
    PARENT_IDS+=("$COMMENT_ID,$MAKE,$MODEL")
    echo -n "."
  else
    ((FAILED++))
    echo -n "x"
    echo "Failed: $RESPONSE" >> /tmp/comment_test_errors.log
  fi
done
echo ""

# Phase 2: Create replies to existing comments (about 100)
echo ""
echo "Phase 2: Creating 100 reply comments..."
for i in {1..100}; do
  # Pick random parent
  if [ ${#PARENT_IDS[@]} -gt 0 ]; then
    PARENT_DATA=${PARENT_IDS[$((RANDOM % ${#PARENT_IDS[@]}))]}
    IFS=',' read -r PARENT_ID MAKE MODEL <<< "$PARENT_DATA"
    
    REPLY_CONTENTS=(
      "Thanks for sharing this tip!"
      "I had the same experience"
      "What year was this?"
      "Did you use OBD or direct connection?"
      "Good to know, will try next time"
      "Confirmed working on 2020 model"
      "Any issues with security module?"
      "How long did the whole job take?"
      "Thanks, this saved me hours!"
      "Used similar approach successfully"
    )
    
    CONTENT="${REPLY_CONTENTS[$((RANDOM % ${#REPLY_CONTENTS[@]}))]}"
    
    PAYLOAD="{\"make\":\"$MAKE\",\"model\":\"$MODEL\",\"content\":\"$CONTENT (reply #$i)\",\"parent_id\":\"$PARENT_ID\"}"
    
    RESPONSE=$(curl -s -X POST "$API_URL/api/vehicle-comments" \
      -H "Content-Type: application/json" \
      -H "$TEST_HEADER" \
      -d "$PAYLOAD")
    
    ((TOTAL++))
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
      ((SUCCESS++))
      echo -n "."
    else
      ((FAILED++))
      echo -n "x"
      echo "Reply Failed: $RESPONSE" >> /tmp/comment_test_errors.log
    fi
  fi
done
echo ""

echo ""
echo "================================"
echo "STRESS TEST COMPLETE"
echo "================================"
echo "Total attempts: $TOTAL"
echo "Successful: $SUCCESS"
echo "Failed: $FAILED"
echo ""

# Summary of comments per vehicle
echo "Comments per vehicle:"
for VEHICLE in "${VEHICLES[@]}"; do
  IFS=',' read -r MAKE MODEL <<< "$VEHICLE"
  KEY=$(echo "${MAKE}_${MODEL}" | tr '[:upper:]' '[:lower:]' | tr ' ' '_')
  COUNT=$(curl -s "$API_URL/api/vehicle-comments?make=$MAKE&model=$MODEL" | grep -o '"comment_count":[0-9]*' | cut -d':' -f2)
  echo "  $MAKE $MODEL: $COUNT comments"
done
