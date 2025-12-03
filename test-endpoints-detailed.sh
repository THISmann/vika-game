#!/bin/bash

# Script de test détaillé avec affichage des réponses
# Usage: ./test-endpoints-detailed.sh [base_url]

set -e

BASE_URL="${1:-http://localhost:30080}"
API_BASE="${BASE_URL}/api"

echo "🧪 Test détaillé des endpoints"
echo "📍 URL de base: $BASE_URL"
echo ""

# Test avec affichage de la réponse
test_detailed() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔍 $description"
  echo "   $method $endpoint"
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n\nHTTP_CODE:%{http_code}" "$endpoint" 2>/dev/null || echo -e "\n\nHTTP_CODE:000")
  elif [ "$method" = "POST" ]; then
    echo "   Data: $data"
    response=$(curl -s -w "\n\nHTTP_CODE:%{http_code}" -X POST "$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data" 2>/dev/null || echo -e "\n\nHTTP_CODE:000")
  elif [ "$method" = "PUT" ]; then
    echo "   Data: $data"
    response=$(curl -s -w "\n\nHTTP_CODE:%{http_code}" -X PUT "$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data" 2>/dev/null || echo -e "\n\nHTTP_CODE:000")
  elif [ "$method" = "DELETE" ]; then
    response=$(curl -s -w "\n\nHTTP_CODE:%{http_code}" -X DELETE "$endpoint" 2>/dev/null || echo -e "\n\nHTTP_CODE:000")
  fi
  
  http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
  body=$(echo "$response" | sed '/HTTP_CODE:/d')
  
  echo "   Status: $http_code"
  echo "   Response:"
  if [ -n "$body" ]; then
    echo "$body" | jq . 2>/dev/null || echo "$body" | head -20
  else
    echo "   (vide)"
  fi
  echo ""
}

# Auth Service
echo "═══════════════════════════════════════════════════════════"
echo "🔐 AUTH SERVICE"
echo "═══════════════════════════════════════════════════════════"

test_detailed "POST" "$API_BASE/auth/admin/login" \
  '{"username":"admin","password":"admin"}' \
  "Admin login"

test_detailed "POST" "$API_BASE/auth/players/register" \
  '{"name":"TestPlayer'$(date +%s)'"}' \
  "Register player"

test_detailed "GET" "$API_BASE/auth/players" \
  "" \
  "Get all players"

# Quiz Service
echo "═══════════════════════════════════════════════════════════"
echo "📝 QUIZ SERVICE"
echo "═══════════════════════════════════════════════════════════"

test_detailed "GET" "$API_BASE/quiz/questions" \
  "" \
  "Get questions (without answers)"

test_detailed "GET" "$API_BASE/quiz/full" \
  "" \
  "Get full questions (with answers)"

test_detailed "POST" "$API_BASE/quiz/create" \
  '{"question":"Test Question '$(date +%s)'","choices":["Option A","Option B","Option C","Option D"],"answer":"Option A"}' \
  "Create question"

# Game Service
echo "═══════════════════════════════════════════════════════════"
echo "🎮 GAME SERVICE"
echo "═══════════════════════════════════════════════════════════"

test_detailed "GET" "$API_BASE/game/state" \
  "" \
  "Get game state"

test_detailed "GET" "$API_BASE/game/code" \
  "" \
  "Get game code"

test_detailed "GET" "$API_BASE/game/leaderboard" \
  "" \
  "Get leaderboard"

echo "✅ Tests terminés"

