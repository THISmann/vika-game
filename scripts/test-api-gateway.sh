#!/bin/bash

# Script pour tester l'API Gateway

BASE_URL="http://localhost:3000"

echo "🧪 Test de l'API Gateway"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    
    echo -n "Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ OK (${http_code})${NC}"
        if [ -n "$body" ] && [ "$body" != "null" ]; then
            echo "   Response: $(echo "$body" | head -c 100)..."
        fi
    else
        echo -e "${RED}❌ FAILED (${http_code})${NC}"
        echo "   Response: $body"
    fi
    echo ""
}

# 1. Health check
test_endpoint "GET" "$BASE_URL/health" "" "Health check"

# 2. Test endpoint
test_endpoint "GET" "$BASE_URL/test" "" "Test endpoint"

# 3. Auth Service
test_endpoint "GET" "$BASE_URL/auth/test" "" "Auth Service - Test"
test_endpoint "GET" "$BASE_URL/auth/players" "" "Auth Service - Get Players"

# 4. Quiz Service
test_endpoint "GET" "$BASE_URL/quiz/test" "" "Quiz Service - Test"
test_endpoint "GET" "$BASE_URL/quiz/all" "" "Quiz Service - Get Questions"

# 5. Game Service
test_endpoint "GET" "$BASE_URL/game/test" "" "Game Service - Test"
test_endpoint "GET" "$BASE_URL/game/state" "" "Game Service - Get State"
test_endpoint "GET" "$BASE_URL/game/code" "" "Game Service - Get Code"

# 6. Test rate limiting (optionnel)
echo -e "${YELLOW}💡 Pour tester le rate limiting, exécutez :${NC}"
echo "   for i in {1..110}; do curl -s -o /dev/null -w '%{http_code}\n' $BASE_URL/test; done"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Tests terminés !"

