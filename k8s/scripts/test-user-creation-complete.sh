#!/bin/bash

# Script complet pour tester la création, validation et login d'un utilisateur
# Usage: ./k8s/scripts/test-user-creation-complete.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

info() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

step() {
    echo -e "${BLUE}📦 $1${NC}"
}

# Variables
NAMESPACE="intelectgame"
TIMESTAMP=$(date +%s)
TEST_EMAIL="testuser${TIMESTAMP}@example.com"
TEST_PASSWORD="testpass123"
TEST_NAME="Test User ${TIMESTAMP}"

info "=== TEST COMPLET CRÉATION/VALIDATION/LOGIN UTILISATEUR ==="
echo ""

# 1. Démarrer port-forwards
step "1. Démarrage des port-forwards..."
pkill -f "kubectl port-forward.*api-gateway" 2>/dev/null || true
pkill -f "kubectl port-forward.*admin-frontend" 2>/dev/null || true
sleep 2

kubectl port-forward -n "$NAMESPACE" svc/api-gateway 3000:3000 > /tmp/api-gateway-test.log 2>&1 &
API_PF_PID=$!
kubectl port-forward -n "$NAMESPACE" svc/admin-frontend 57958:80 > /tmp/admin-frontend-test.log 2>&1 &
ADMIN_PF_PID=$!
sleep 5

# Vérifier que les port-forwards fonctionnent
if ! curl -s --max-time 3 http://127.0.0.1:3000/health > /dev/null 2>&1; then
    error "API Gateway non accessible via port-forward"
    exit 1
fi
info "Port-forwards démarrés"
echo ""

# 2. Création d'un compte utilisateur
step "2. Création d'un compte utilisateur..."
USER_RESPONSE=$(curl -s -X POST "http://127.0.0.1:3000/auth/users/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_NAME\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"contact\": \"+1234567890\",
    \"useCase\": \"testing\",
    \"country\": \"FR\"
  }")

HTTP_CODE=$(curl -s -o /tmp/user_response.json -w "%{http_code}" -X POST "http://127.0.0.1:3000/auth/users/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_NAME\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"contact\": \"+1234567890\",
    \"useCase\": \"testing\",
    \"country\": \"FR\"
  }")

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    USER_DATA=$(cat /tmp/user_response.json)
    USER_ID=$(echo "$USER_DATA" | jq -r '.id // empty')
    echo "$USER_DATA" | jq '{id, name, email, status}'
    info "Compte créé avec succès - User ID: $USER_ID"
else
    error "Échec de la création - HTTP $HTTP_CODE"
    cat /tmp/user_response.json | jq . 2>/dev/null || cat /tmp/user_response.json
    exit 1
fi
echo ""

# 3. Login admin
step "3. Login admin..."
ADMIN_RESPONSE=$(curl -s -X POST "http://127.0.0.1:3000/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}')

ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | jq -r '.token // empty')
if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
    error "Échec du login admin"
    echo "$ADMIN_RESPONSE" | jq .
    exit 1
fi
info "Login admin réussi - Token obtenu"
echo ""

# 4. Liste des utilisateurs
step "4. Liste des utilisateurs (filtre: pending)..."
USERS_RESPONSE=$(curl -s -X GET "http://127.0.0.1:3000/auth/admin/users?status=pending&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json")

echo "$USERS_RESPONSE" | jq '{pagination, users: (.users // [] | map({id, name, email, status}))}' 2>/dev/null || echo "$USERS_RESPONSE"
PENDING_COUNT=$(echo "$USERS_RESPONSE" | jq '.users | length' 2>/dev/null || echo "0")
info "Nombre d'utilisateurs en attente: $PENDING_COUNT"
echo ""

# 5. Approbation de l'utilisateur
step "5. Approbation de l'utilisateur (ID: $USER_ID)..."
APPROVE_RESPONSE=$(curl -s -X PUT "http://127.0.0.1:3000/auth/admin/users/$USER_ID/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json")

APPROVE_SUCCESS=$(echo "$APPROVE_RESPONSE" | jq -r '.success // false' 2>/dev/null || echo "false")
if [ "$APPROVE_SUCCESS" = "true" ]; then
    echo "$APPROVE_RESPONSE" | jq '{success, user: {id, name, email, status}}'
    info "Utilisateur approuvé avec succès"
else
    error "Échec de l'approbation"
    echo "$APPROVE_RESPONSE" | jq . 2>/dev/null || echo "$APPROVE_RESPONSE"
    exit 1
fi
echo ""

# 6. Test login avec le compte approuvé
step "6. Test login avec le compte approuvé..."
USER_LOGIN_RESPONSE=$(curl -s -X POST "http://127.0.0.1:3000/auth/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

USER_TOKEN=$(echo "$USER_LOGIN_RESPONSE" | jq -r '.token // empty' 2>/dev/null || echo "")
if [ -n "$USER_TOKEN" ] && [ "$USER_TOKEN" != "null" ]; then
    echo "$USER_LOGIN_RESPONSE" | jq '{token: (.token != null), user: {id, name, email, status}}'
    info "Login utilisateur réussi!"
else
    error "Échec du login utilisateur"
    echo "$USER_LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$USER_LOGIN_RESPONSE"
    exit 1
fi
echo ""

# Résumé
info "=== TOUS LES TESTS RÉUSSIS ==="
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
info "🌐 FRONTEND ADMIN:"
echo "   URL: http://127.0.0.1:57958/admin/users"
echo "   Login: http://127.0.0.1:57958/admin/login"
echo "   Credentials: admin/admin"
echo ""
info "📋 COMPTE CRÉÉ ET TESTÉ:"
echo "   Email: $TEST_EMAIL"
echo "   Password: $TEST_PASSWORD"
echo "   User ID: $USER_ID"
echo "   Status: approved"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
warn "⚠️  Les port-forwards sont actifs. Pour les arrêter:"
echo "   kill $API_PF_PID $ADMIN_PF_PID"
echo ""

# Garder les port-forwards actifs
wait

