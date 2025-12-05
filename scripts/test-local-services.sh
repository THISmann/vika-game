#!/bin/bash

# Script pour tester tous les services en local avec Docker Compose

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🧪 Test des Services Locaux (Docker Compose)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    
    echo -n "Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ OK (${http_code})${NC}"
        if [ -n "$body" ] && [ "$body" != "null" ] && [ "${#body}" -lt 200 ]; then
            echo "   Response: $body"
        fi
    else
        echo -e "${RED}❌ FAILED (${http_code})${NC}"
        if [ -n "$body" ]; then
            echo "   Response: $(echo "$body" | head -c 100)..."
        fi
    fi
    echo ""
}

# Vérifier que Docker Compose est actif
echo -e "${BLUE}📦 Vérification de Docker Compose...${NC}"
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}❌ Docker Compose n'est pas actif !${NC}"
    echo "   Lancez : docker-compose up -d"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose est actif${NC}"
echo ""

# 1. Health check de l'API Gateway
echo -e "${BLUE}1. API Gateway${NC}"
test_endpoint "GET" "$BASE_URL/health" "" "Health check"
test_endpoint "GET" "$BASE_URL/test" "" "Test endpoint"

# 2. Auth Service
echo -e "${BLUE}2. Auth Service${NC}"
test_endpoint "GET" "$BASE_URL/auth/test" "" "Auth Service - Test"
test_endpoint "GET" "$BASE_URL/auth/players" "" "Auth Service - Get Players"

# 3. Quiz Service
echo -e "${BLUE}3. Quiz Service${NC}"
test_endpoint "GET" "$BASE_URL/quiz/test" "" "Quiz Service - Test"
test_endpoint "GET" "$BASE_URL/quiz/all" "" "Quiz Service - Get Questions"

# 4. Game Service
echo -e "${BLUE}4. Game Service${NC}"
test_endpoint "GET" "$BASE_URL/game/test" "" "Game Service - Test"
test_endpoint "GET" "$BASE_URL/game/code" "" "Game Service - Get Code"
test_endpoint "GET" "$BASE_URL/game/state" "" "Game Service - Get State"

# 5. Vérifier les conteneurs
echo -e "${BLUE}5. Statut des Conteneurs${NC}"
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" | head -10
echo ""

# 6. Vérifier les logs d'erreur
echo -e "${BLUE}6. Vérification des Erreurs${NC}"
errors=$(docker-compose logs --tail=50 2>&1 | grep -i "error\|❌" | head -5)
if [ -z "$errors" ]; then
    echo -e "${GREEN}✅ Aucune erreur récente détectée${NC}"
else
    echo -e "${YELLOW}⚠️  Erreurs détectées :${NC}"
    echo "$errors"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Tests terminés !${NC}"
echo ""
echo "🌐 Frontend disponible sur : http://localhost:5173"
echo "📡 API Gateway disponible sur : http://localhost:3000"

