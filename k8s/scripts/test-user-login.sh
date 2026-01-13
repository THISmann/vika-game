#!/bin/bash

# Script pour tester la connexion user sur /user/login
# Usage: ./k8s/scripts/test-user-login.sh

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

# Nettoyer les port-forwards existants
info "Nettoyage des port-forwards existants..."
pkill -f "kubectl port-forward.*api-gateway" 2>/dev/null || true
pkill -f "kubectl port-forward.*frontend" 2>/dev/null || true
sleep 2

# Démarrer port-forward pour API Gateway
step "Démarrage du port-forward pour API Gateway (port 3000)..."
kubectl port-forward -n intelectgame svc/api-gateway 3000:3000 > /tmp/api-gateway-user-pf.log 2>&1 &
API_GATEWAY_PID=$!
sleep 3

# Démarrer port-forward pour Frontend
step "Démarrage du port-forward pour Frontend (port 56292)..."
kubectl port-forward -n intelectgame svc/frontend 56292:80 > /tmp/frontend-user-pf.log 2>&1 &
FRONTEND_PID=$!
sleep 3

info "Port-forwards démarrés"
echo ""

# Tester la connexion user
step "Test de la connexion user..."
echo "Credentials:"
echo "   Email: admin@vika-game.com"
echo "   Password: admin"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "http://127.0.0.1:3000/auth/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vika-game.com","password":"admin"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    info "✅ Connexion user réussie!"
    echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
    echo ""
    info "✅ Frontend User accessible sur: http://127.0.0.1:56292/user/login"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    info "🌐 FRONTEND USER ACCESSIBLE:"
    echo "   URL: http://127.0.0.1:56292/user/login"
    echo ""
    info "🔑 CREDENTIALS:"
    echo "   Email: admin@vika-game.com"
    echo "   Password: admin"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    warn "⚠️  Les port-forwards sont actifs. Ne fermez pas ce terminal."
    warn "   Pour arrêter: Appuyez sur Ctrl+C"
else
    error "❌ Échec du test de connexion user"
    echo "Réponse: $LOGIN_RESPONSE"
fi

# Fonction de nettoyage
cleanup() {
    echo ""
    info "Arrêt des port-forwards..."
    kill $API_GATEWAY_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    pkill -f "kubectl port-forward.*api-gateway" 2>/dev/null || true
    pkill -f "kubectl port-forward.*frontend" 2>/dev/null || true
    info "Port-forwards arrêtés."
    exit 0
}

# Capturer Ctrl+C
trap cleanup EXIT INT TERM

# Attendre indéfiniment
info "Port-forwards actifs. En attente..."
wait

