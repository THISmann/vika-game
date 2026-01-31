#!/bin/bash
# Test complet du flux production: inscription, login, création question, création partie
# Usage: AUTH_URL=http://localhost/api/auth GAME_URL=http://localhost/api/game QUIZ_URL=http://localhost/api/quiz ./test-production-flow.sh
# Ou depuis serveur: Host: vika-game.ru
BASE="${BASE:-http://localhost}"
AUTH="$BASE/api/auth"
QUIZ="$BASE/api/quiz"
GAME="$BASE/api/game"
HOST="${HOST:-Host: vika-game.ru}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}✅ $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; }
info() { echo -e "${YELLOW}→ $1${NC}"; }

TS=$(date +%s)
EMAIL="testflow-${TS}@test.local"
PASS="testpass123"
NAME="Test Flow User"

info "Testing production flow on $BASE ($HOST)"
echo ""

# 1. Inscription
info "1. Inscription: $EMAIL"
R=$(curl -s -w "\n%{http_code}" -X POST "$AUTH/users/register" \
  -H "Content-Type: application/json" \
  -H "$HOST" \
  -d "{\"email\":\"$EMAIL\",\"name\":\"$NAME\",\"password\":\"$PASS\"}" 2>/dev/null)
HTTP=$(echo "$R" | tail -1)
BODY=$(echo "$R" | head -n -1)
if [[ "$HTTP" == "201" || "$HTTP" == "200" ]]; then
  pass "Inscription OK ($HTTP)"
else
  fail "Inscription KO ($HTTP): $BODY"
  exit 1
fi

# 2. Login
info "2. Login: $EMAIL"
R=$(curl -s -w "\n%{http_code}" -X POST "$AUTH/users/login" \
  -H "Content-Type: application/json" \
  -H "$HOST" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" 2>/dev/null)
HTTP=$(echo "$R" | tail -1)
BODY=$(echo "$R" | head -n -1)
TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [[ -n "$TOKEN" && ("$HTTP" == "200" || "$HTTP" == "201") ]]; then
  pass "Login OK - token obtenu"
else
  fail "Login KO ($HTTP): $BODY"
  exit 1
fi

# 3. Créer une question
info "3. Création question"
R=$(curl -s -w "\n%{http_code}" -X POST "$QUIZ/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "$HOST" \
  -d '{"question":"Question test flow?","choices":["A","B","C"],"answer":"A"}' 2>/dev/null)
HTTP=$(echo "$R" | tail -1)
BODY=$(echo "$R" | head -n -1)
QID=$(echo "$BODY" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [[ -n "$QID" && "$HTTP" == "200" ]]; then
  pass "Question créée OK (id=$QID)"
else
  fail "Création question KO ($HTTP): $BODY"
fi

# 4. Récupérer les questions utilisateur
info "4. Liste questions utilisateur"
R=$(curl -s -w "\n%{http_code}" -X GET "$QUIZ/user/questions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "$HOST" 2>/dev/null)
HTTP=$(echo "$R" | tail -1)
BODY=$(echo "$R" | head -n -1)
if [[ "$HTTP" == "200" ]]; then
  CNT=$(echo "$BODY" | grep -o '"_id"' | wc -l | tr -d ' ')
  pass "Liste questions OK (${CNT} question(s))"
else
  fail "Liste questions KO ($HTTP)"
fi

# 5. Créer une partie (nécessite au moins une question)
info "5. Création partie"
R=$(curl -s -w "\n%{http_code}" -X POST "$GAME/parties" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "$HOST" \
  -d "{\"name\":\"Partie Test $TS\",\"questionIds\":[\"$QID\"]}" 2>/dev/null)
HTTP=$(echo "$R" | tail -1)
BODY=$(echo "$R" | head -n -1)
CODE=$(echo "$BODY" | grep -oE '"(code|gameCode)":"[^"]*"' | head -1 | cut -d'"' -f4)
if [[ -n "$CODE" && ("$HTTP" == "200" || "$HTTP" == "201") ]]; then
  pass "Partie créée OK (code=$CODE)"
else
  fail "Création partie KO ($HTTP): $BODY"
fi

# 6. Vérifier le code
info "6. Vérification code partie"
R=$(curl -s -w "\n%{http_code}" -X POST "$GAME/verify-code" \
  -H "Content-Type: application/json" \
  -H "$HOST" \
  -d "{\"code\":\"$CODE\"}" 2>/dev/null)
HTTP=$(echo "$R" | tail -1)
if [[ "$HTTP" == "200" ]]; then
  pass "Code vérifié OK"
else
  fail "Vérification code KO ($HTTP)"
fi

echo ""
echo -e "${GREEN}=== Tous les tests passés ===${NC}"
echo "URL: $BASE | Compte test: $EMAIL / $PASS"
