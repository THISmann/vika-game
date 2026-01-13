#!/bin/bash

# Script pour créer les identifiants pour les frontends admin et user
# Usage: ./k8s/scripts/create-frontend-credentials.sh

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

# Configuration
NAMESPACE="intelectgame"
API_GATEWAY_PORT=3000
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin"
USER_EMAIL="user@vika-game.com"
USER_PASSWORD="user123"
USER_NAME="User Player"

# Nettoyer les port-forwards existants
info "Nettoyage des port-forwards existants..."
pkill -f "kubectl port-forward.*api-gateway" 2>/dev/null || true
sleep 2

# Démarrer port-forward pour API Gateway
step "Démarrage du port-forward pour API Gateway (port $API_GATEWAY_PORT)..."
kubectl port-forward -n "$NAMESPACE" svc/api-gateway "$API_GATEWAY_PORT":"$API_GATEWAY_PORT" > /tmp/api-gateway-creds.log 2>&1 &
API_GATEWAY_PID=$!
sleep 5

info "Port-forward démarré. Attente de 5 secondes pour stabilisation..."
sleep 5

echo ""
step "=== CRÉATION DES IDENTIFIANTS ==="
echo ""

# Test API Gateway
step "1. Test API Gateway:"
HEALTH_RESPONSE=$(curl -s -m 10 "http://127.0.0.1:$API_GATEWAY_PORT/health")
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    info "   ✅ API Gateway accessible"
else
    error "   ❌ API Gateway non accessible"
    kill $API_GATEWAY_PID 2>/dev/null || true
    exit 1
fi

# Login admin
step "2. Login admin pour obtenir le token:"
ADMIN_LOGIN_RESPONSE=$(curl -s -m 10 -X POST "http://127.0.0.1:$API_GATEWAY_PORT/auth/admin/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}")

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | jq -r '.token // empty' 2>/dev/null || echo "")

if [ -n "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
    info "   ✅ Login admin réussi. Token obtenu."
else
    error "   ❌ Erreur login admin:"
    echo "$ADMIN_LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$ADMIN_LOGIN_RESPONSE"
    kill $API_GATEWAY_PID 2>/dev/null || true
    exit 1
fi

# Création compte utilisateur
step "3. Création d'un compte utilisateur:"
USER_REGISTER_RESPONSE=$(curl -s -m 10 -X POST "http://127.0.0.1:$API_GATEWAY_PORT/auth/users/register" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$USER_NAME\",\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\"}")

USER_ID=$(echo "$USER_REGISTER_RESPONSE" | jq -r '.id // empty' 2>/dev/null || echo "")

if [ -n "$USER_ID" ]; then
    info "   ✅ Compte utilisateur créé: ID $USER_ID"
else
    # Vérifier si le compte existe déjà
    EXISTING_USER=$(curl -s -m 10 -X GET "http://127.0.0.1:$API_GATEWAY_PORT/auth/admin/users" \
        -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r ".users[] | select(.email==\"$USER_EMAIL\") | .id" 2>/dev/null || echo "")
    
    if [ -n "$EXISTING_USER" ]; then
        warn "   ⚠️  Compte utilisateur existe déjà: ID $EXISTING_USER"
        USER_ID=$EXISTING_USER
    else
        error "   ❌ Erreur création compte utilisateur:"
        echo "$USER_REGISTER_RESPONSE" | jq . 2>/dev/null || echo "$USER_REGISTER_RESPONSE"
        kill $API_GATEWAY_PID 2>/dev/null || true
        exit 1
    fi
fi

# Approbation du compte utilisateur
step "4. Approbation du compte utilisateur (ID: $USER_ID):"
APPROVE_RESPONSE=$(curl -s -m 10 -X PUT "http://127.0.0.1:$API_GATEWAY_PORT/auth/admin/users/$USER_ID/approve" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json")

if echo "$APPROVE_RESPONSE" | grep -q "status.*approved"; then
    info "   ✅ Utilisateur approuvé."
else
    warn "   ⚠️  L'utilisateur pourrait déjà être approuvé ou erreur:"
    echo "$APPROVE_RESPONSE" | jq . 2>/dev/null || echo "$APPROVE_RESPONSE"
fi

# Test login utilisateur
step "5. Test login avec le compte utilisateur:"
USER_LOGIN_RESPONSE=$(curl -s -m 10 -X POST "http://127.0.0.1:$API_GATEWAY_PORT/auth/users/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\"}")

USER_TOKEN=$(echo "$USER_LOGIN_RESPONSE" | jq -r '.token // empty' 2>/dev/null || echo "")

if [ -n "$USER_TOKEN" ] && [ "$USER_TOKEN" != "null" ]; then
    info "   ✅ Login utilisateur réussi. Token obtenu."
else
    error "   ❌ Erreur login utilisateur:"
    echo "$USER_LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$USER_LOGIN_RESPONSE"
fi

echo ""
info "=== ✅ IDENTIFIANTS CRÉÉS ==="
echo ""
echo "✅ FRONTEND ADMIN:"
echo "   URL: http://127.0.0.1:57958/admin/login"
echo "   Username: $ADMIN_USERNAME"
echo "   Password: $ADMIN_PASSWORD"
echo ""
echo "✅ FRONTEND USER:"
echo "   URL: http://127.0.0.1:64802/user/login"
echo "   Email: $USER_EMAIL"
echo "   Password: $USER_PASSWORD"
echo ""
echo "✅ Documentation complète dans: k8s/CREDENTIALS_FRONTENDS.md"
echo ""

# Garder le port-forward actif
info "Port-forward actif. Appuyez sur Ctrl+C pour arrêter."
wait $API_GATEWAY_PID

