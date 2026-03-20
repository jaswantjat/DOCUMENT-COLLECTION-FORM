#!/bin/bash

echo "======================================"
echo "  Eltex Form - Automated Test Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3001/api"

echo -e "${BLUE}Test 1: Valid Project Code${NC}"
response=$(curl -s "$BASE_URL/project/ELT20250001")
if python3 -c "import sys, json; d=json.load(sys.stdin); sys.exit(0 if d.get('success') else 1)" <<< "$response"; then
    echo -e "${GREEN}✓ PASS${NC} - Valid project code works"
else
    echo -e "${RED}✗ FAIL${NC} - Valid project code failed"
fi
echo ""

echo -e "${BLUE}Test 2: Invalid Project Code${NC}"
response=$(curl -s "$BASE_URL/project/INVALID123")
if python3 -c "import sys, json; d=json.load(sys.stdin); sys.exit(0 if not d.get('success') else 1)" <<< "$response"; then
    echo -e "${GREEN}✓ PASS${NC} - Invalid code returns error"
else
    echo -e "${RED}✗ FAIL${NC} - Invalid code didn't return error"
fi
echo ""

echo -e "${BLUE}Test 3: Owner Update (Yes)${NC}"
response=$(curl -s -X POST "$BASE_URL/owner" \
  -H "Content-Type: application/json" \
  -d '{"projectCode":"ELT20250001","isOwner":true}')
if python3 -c "import sys, json; d=json.load(sys.stdin); sys.exit(0 if d.get('success') else 1)" <<< "$response"; then
    echo -e "${GREEN}✓ PASS${NC} - Owner match updated"
else
    echo -e "${RED}✗ FAIL${NC} - Owner update failed"
fi
echo ""

echo -e "${BLUE}Test 4: Owner Update (No) with Details${NC}"
response=$(curl -s -X POST "$BASE_URL/owner" \
  -H "Content-Type: application/json" \
  -d '{
    "projectCode":"ELT20250002",
    "isOwner":false,
    "ownerDetails":{
      "name":"Pedro Martínez",
      "phone":"+34 655 444 333",
      "relation":"padre_madre"
    }
  }')
if python3 -c "import sys, json; d=json.load(sys.stdin); sys.exit(0 if d.get('success') else 1)" <<< "$response"; then
    echo -e "${GREEN}✓ PASS${NC} - Owner details saved"
else
    echo -e "${RED}✗ FAIL${NC} - Owner details failed"
fi
echo ""

echo -e "${BLUE}Test 5: IBAN Update${NC}"
response=$(curl -s -X POST "$BASE_URL/iban" \
  -H "Content-Type: application/json" \
  -d '{"projectCode":"ELT20250001","iban":"ES1234567890123456789012"}')
if python3 -c "import sys, json; d=json.load(sys.stdin); sys.exit(0 if d.get('success') else 1)" <<< "$response"; then
    echo -e "${GREEN}✓ PASS${NC} - IBAN saved"
else
    echo -e "${RED}✗ FAIL${NC} - IBAN save failed"
fi
echo ""

echo -e "${BLUE}Test 6: Check Project Status${NC}"
response=$(curl -s "$BASE_URL/status/ELT20250001")
if python3 -c "import sys, json; d=json.load(sys.stdin); sys.exit(0 if d.get('success') else 1)" <<< "$response"; then
    echo -e "${GREEN}✓ PASS${NC} - Status check works"
else
    echo -e "${RED}✗ FAIL${NC} - Status check failed"
fi
echo ""

echo -e "${BLUE}Test 7: Verify Data Persistence${NC}"
status=$(curl -s "$BASE_URL/status/ELT20250001")
owner_match=$(echo "$status" | grep -o '"ownerMatch":true')
iban=$(echo "$status" | grep -o 'ES1234567890123456789012')

if [ -n "$owner_match" ] && [ -n "$iban" ]; then
    echo -e "${GREEN}✓ PASS${NC} - Data persists across requests"
else
    echo -e "${RED}✗ FAIL${NC} - Data not persisting"
fi
echo ""

echo -e "${BLUE}Test 8: Project 2 Status${NC}"
status=$(curl -s "$BASE_URL/status/ELT20250002")
owner_details=$(echo "$status" | grep -o 'Pedro Martínez')

if [ -n "$owner_details" ]; then
    echo -e "${GREEN}✓ PASS${NC} - Owner details saved for project 2"
else
    echo -e "${RED}✗ FAIL${NC} - Owner details not found"
fi
echo ""

echo "======================================"
echo -e "${GREEN}All API Tests Complete!${NC}"
echo "======================================"
echo ""
echo "Now test the frontend in your browser:"
echo -e "${YELLOW}Test Launcher:${NC} http://localhost:8080/test.html"
echo ""
echo -e "${YELLOW}Direct Form Links:${NC}"
echo "  María (Customer): http://localhost:8080/frontend/index.html?code=ELT20250001&source=customer"
echo "  Juan (Customer):  http://localhost:8080/frontend/index.html?code=ELT20250002&source=customer"
echo "  María (Assessor): http://localhost:8080/frontend/index.html?code=ELT20250001&source=assessor"
echo ""
echo -e "${YELLOW}To stop servers:${NC}"
echo "  Kill backend: Ctrl+C in terminal, or kill $(pgrep -f 'node server.js')"
echo "  Kill frontend: kill $(pgrep -f 'python3 -m http.server')"
echo ""
