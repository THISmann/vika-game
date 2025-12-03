#!/bin/bash

# Script pour tester tous les endpoints des micro-services
# Usage: ./test-all-endpoints.sh [base_url]
# Exemple: ./test-all-endpoints.sh http://82.202.141.248
#          ./test-all-endpoints.sh http://localhost:30080

set -e

BASE_URL="${1:-http://localhost:30080}"
API_BASE="${BASE_URL}/api"

echo "🧪 Test de tous les endpoints des micro-services"
echo "📍 URL de base: $BASE_URL"
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
TOTAL=0
PASSED=0
FAILED=0

# Fonction pour tester un endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4
  local expected_status=${5:-200}
  
  TOTAL=$((TOTAL + 1))
  
  echo -n "Testing: $description ... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$endpoint" 2>/dev/null || echo -e "\n000")
  elif [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data" 2>/dev/null || echo -e "\n000")
  elif [ "$method" = "PUT" ]; then
    response=$(curl -s -w "\n%{http_code}" -X PUT "$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data" 2>/dev/null || echo -e "\n000")
  elif [ "$method" = "DELETE" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$endpoint" 2>/dev/null || echo -e "\n000")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" = "$expected_status" ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
    PASSED=$((PASSED + 1))
    return 0
  else
    echo -e "${RED}❌ FAIL${NC} (HTTP $http_code, attendu $expected_status)"
    if [ -n "$body" ]; then
      echo "   Réponse: $(echo "$body" | head -c 200)"
    fi
    FAILED=$((FAILED + 1))
    return 1
  fi
}

echo "═══════════════════════════════════════════════════════════"
echo "🔐 AUTH SERVICE"
echo "═══════════════════════════════════════════════════════════"

# Test admin login
test_endpoint "POST" "$API_BASE/auth/admin/login" \
  '{"username":"admin","password":"admin"}' \
  "Admin login" 200

# Récupérer le token (si disponible)
TOKEN=$(curl -s -X POST "$API_BASE/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' 2>/dev/null | grep -o '"token":"[^"]*' | cut -d'"' -f4 || echo "")

# Test register player
PLAYER_DATA='{"name":"TestPlayer'$(date +%s)'"}'
test_endpoint "POST" "$API_BASE/auth/players/register" \
  "$PLAYER_DATA" \
  "Register player" 201

# Récupérer l'ID du joueur créé
PLAYER_ID=$(curl -s -X POST "$API_BASE/auth/players/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"TestPlayerGet'$(date +%s)'"}' 2>/dev/null | grep -o '"id":"[^"]*' | cut -d'"' -f4 || echo "")

# Test get all players
test_endpoint "GET" "$API_BASE/auth/players" \
  "" \
  "Get all players" 200

# Test get player by ID (si on a un ID)
if [ -n "$PLAYER_ID" ]; then
  test_endpoint "GET" "$API_BASE/auth/players/$PLAYER_ID" \
    "" \
    "Get player by ID" 200
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📝 QUIZ SERVICE"
echo "═══════════════════════════════════════════════════════════"

# Test get questions (sans réponses)
test_endpoint "GET" "$API_BASE/quiz/questions" \
  "" \
  "Get questions (without answers)" 200

# Test get full questions (avec réponses)
test_endpoint "GET" "$API_BASE/quiz/full" \
  "" \
  "Get full questions (with answers)" 200

# Test create question
QUESTION_DATA='{"question":"Test Question '$(date +%s)'","choices":["Option A","Option B","Option C","Option D"],"answer":"Option A"}'
test_endpoint "POST" "$API_BASE/quiz/create" \
  "$QUESTION_DATA" \
  "Create question" 200

# Récupérer l'ID de la question créée
QUESTION_ID=$(curl -s -X POST "$API_BASE/quiz/create" \
  -H "Content-Type: application/json" \
  -d '{"question":"TestQuestionGet'$(date +%s)'","choices":["A","B","C","D"],"answer":"A"}' 2>/dev/null | grep -o '"id":"[^"]*' | cut -d'"' -f4 || echo "")

# Test update question (si on a un ID)
if [ -n "$QUESTION_ID" ]; then
  UPDATE_DATA='{"question":"Updated Question","choices":["New A","New B","New C","New D"],"answer":"New A"}'
  test_endpoint "PUT" "$API_BASE/quiz/$QUESTION_ID" \
    "$UPDATE_DATA" \
    "Update question" 200
fi

# Test delete question (si on a un ID)
if [ -n "$QUESTION_ID" ]; then
  test_endpoint "DELETE" "$API_BASE/quiz/$QUESTION_ID" \
    "" \
    "Delete question" 200
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎮 GAME SERVICE"
echo "═══════════════════════════════════════════════════════════"

# Test get game state
test_endpoint "GET" "$API_BASE/game/state" \
  "" \
  "Get game state" 200

# Test get game code
test_endpoint "GET" "$API_BASE/game/code" \
  "" \
  "Get game code" 200

# Test get connected players count
test_endpoint "GET" "$API_BASE/game/players/count" \
  "" \
  "Get connected players count" 200

# Test get leaderboard
test_endpoint "GET" "$API_BASE/game/leaderboard" \
  "" \
  "Get leaderboard" 200

# Test get question results
test_endpoint "GET" "$API_BASE/game/results" \
  "" \
  "Get question results" 200

# Test get score (si on a un player ID)
if [ -n "$PLAYER_ID" ]; then
  test_endpoint "GET" "$API_BASE/game/score/$PLAYER_ID" \
    "" \
    "Get player score" 200
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 RÉSUMÉ"
echo "═══════════════════════════════════════════════════════════"

echo "Total: $TOTAL tests"
echo -e "${GREEN}✅ Réussis: $PASSED${NC}"
echo -e "${RED}❌ Échoués: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
  echo ""
  echo -e "${GREEN}🎉 Tous les tests sont passés!${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}⚠️  Certains tests ont échoué. Vérifiez les logs des services.${NC}"
  exit 1
fi

