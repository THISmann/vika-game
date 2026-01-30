#!/bin/bash

# Script pour créer les identifiants locaux pour les frontends
# Usage: ./scripts/create-local-credentials.sh

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
AUTH_SERVICE_URL="http://localhost:3001"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin"
CLIENT_EMAIL="client@vika-game.com"
CLIENT_PASSWORD="client123"
CLIENT_NAME="Client"

echo ""
step "=== CRÉATION DES IDENTIFIANTS LOCAUX ==="
echo ""

# Test API Gateway
step "1. Test Auth Service:"
HEALTH_RESPONSE=$(curl -s -m 10 "$AUTH_SERVICE_URL/auth/health" || echo "")
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    info "   ✅ Auth Service accessible"
else
    error "   ❌ Auth Service non accessible"
    error "   Assurez-vous que le service d'authentification est démarré sur le port 3001"
    exit 1
fi

# Login admin
step "2. Login admin pour obtenir le token:"
ADMIN_LOGIN_RESPONSE=$(curl -s -m 10 -X POST "$AUTH_SERVICE_URL/auth/admin/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}")

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 || echo "")

if [ -n "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
    info "   ✅ Login admin réussi. Token obtenu."
else
    error "   ❌ Erreur login admin:"
    echo "$ADMIN_LOGIN_RESPONSE" | head -c 200
    echo ""
    exit 1
fi

# Vérifier si le compte client existe déjà
step "3. Vérification du compte client:"
EXISTING_USER=$(curl -s -m 10 -X GET "$AUTH_SERVICE_URL/auth/admin/users" \
    -H "Authorization: Bearer $ADMIN_TOKEN" 2>/dev/null | grep -o "\"email\":\"$CLIENT_EMAIL\"" || echo "")

if [ -n "$EXISTING_USER" ]; then
    warn "   ⚠️  Compte client existe déjà"
    USER_ID=$(curl -s -m 10 -X GET "$AUTH_SERVICE_URL/auth/admin/users" \
        -H "Authorization: Bearer $ADMIN_TOKEN" 2>/dev/null | \
        grep -A 5 "\"email\":\"$CLIENT_EMAIL\"" | grep -o "\"id\":\"[^\"]*\"" | cut -d'"' -f4 | head -1)
    
    if [ -z "$USER_ID" ]; then
        # Essayer de récupérer l'ID différemment
        USER_ID=$(curl -s -m 10 -X GET "$AUTH_SERVICE_URL/auth/admin/users" \
            -H "Authorization: Bearer $ADMIN_TOKEN" 2>/dev/null | \
            grep -o "\"id\":\"[^\"]*\"" | head -1 | cut -d'"' -f4)
    fi
else
    # Création compte utilisateur
    step "4. Création d'un compte utilisateur:"
    USER_REGISTER_RESPONSE=$(curl -s -m 10 -X POST "$AUTH_SERVICE_URL/auth/users/register" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"$CLIENT_NAME\",\"email\":\"$CLIENT_EMAIL\",\"password\":\"$CLIENT_PASSWORD\"}")

    USER_ID=$(echo "$USER_REGISTER_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 || echo "")

    if [ -n "$USER_ID" ]; then
        info "   ✅ Compte utilisateur créé: ID $USER_ID"
    else
        error "   ❌ Erreur création compte utilisateur:"
        echo "$USER_REGISTER_RESPONSE" | head -c 200
        echo ""
        exit 1
    fi
fi

# Approbation du compte utilisateur
if [ -n "$USER_ID" ]; then
    step "5. Approbation du compte utilisateur (ID: $USER_ID):"
    APPROVE_RESPONSE=$(curl -s -m 10 -X PUT "$AUTH_SERVICE_URL/auth/admin/users/$USER_ID/approve" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json")

    if echo "$APPROVE_RESPONSE" | grep -q "status.*approved"; then
        info "   ✅ Utilisateur approuvé."
    else
        warn "   ⚠️  L'utilisateur pourrait déjà être approuvé ou erreur:"
        echo "$APPROVE_RESPONSE" | head -c 200
        echo ""
    fi
fi

# Test login utilisateur
step "6. Test login avec le compte utilisateur:"
USER_LOGIN_RESPONSE=$(curl -s -m 10 -X POST "$AUTH_SERVICE_URL/auth/users/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$CLIENT_EMAIL\",\"password\":\"$CLIENT_PASSWORD\"}")

USER_TOKEN=$(echo "$USER_LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 || echo "")

if [ -n "$USER_TOKEN" ] && [ "$USER_TOKEN" != "null" ]; then
    info "   ✅ Login utilisateur réussi. Token obtenu."
else
    error "   ❌ Erreur login utilisateur:"
    echo "$USER_LOGIN_RESPONSE" | head -c 200
    echo ""
fi

echo ""
info "=== ✅ IDENTIFIANTS CRÉÉS ET TESTÉS ==="
echo ""
echo "✅ FRONTEND ADMIN:"
echo "   URL: http://localhost:5174/vika-admin/login"
echo "   Username: $ADMIN_USERNAME"
echo "   Password: $ADMIN_PASSWORD"
echo ""
echo "✅ FRONTEND CLIENT:"
echo "   URL: http://localhost:5173/auth/login"
echo "   Email: $CLIENT_EMAIL"
echo "   Password: $CLIENT_PASSWORD"
echo ""
echo "✅ Documentation complète dans: CREDENTIALS_LOCAL.md"
echo ""
