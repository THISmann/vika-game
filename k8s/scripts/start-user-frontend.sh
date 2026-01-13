#!/bin/bash

# Script pour démarrer le frontend user avec les port-forwards nécessaires
# Usage: ./k8s/scripts/start-user-frontend.sh

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

NAMESPACE="intelectgame"
FRONTEND_PORT="64802"
API_GATEWAY_PORT="3000"

# Nettoyer les port-forwards existants
step "Nettoyage des port-forwards existants..."
pkill -f "kubectl port-forward.*frontend.*64802" 2>/dev/null || true
pkill -f "kubectl port-forward.*api-gateway.*3000" 2>/dev/null || true
sleep 2
info "Port-forwards nettoyés"

# Démarrer port-forward pour API Gateway
step "Démarrage du port-forward pour API Gateway (port $API_GATEWAY_PORT)..."
kubectl port-forward -n "$NAMESPACE" svc/api-gateway "$API_GATEWAY_PORT:3000" > /tmp/api-gateway-user-pf.log 2>&1 &
API_GATEWAY_PID=$!
sleep 3

# Vérifier que l'API Gateway est accessible
if curl -s --max-time 5 "http://127.0.0.1:$API_GATEWAY_PORT/health" > /dev/null 2>&1; then
    info "API Gateway accessible sur http://127.0.0.1:$API_GATEWAY_PORT"
else
    error "API Gateway non accessible. Vérifiez les logs: /tmp/api-gateway-user-pf.log"
    exit 1
fi

# Démarrer port-forward pour Frontend
step "Démarrage du port-forward pour Frontend (port $FRONTEND_PORT)..."
kubectl port-forward -n "$NAMESPACE" svc/frontend "$FRONTEND_PORT:80" > /tmp/frontend-user-pf.log 2>&1 &
FRONTEND_PID=$!
sleep 3

# Vérifier que le frontend est accessible
if curl -s --max-time 5 "http://127.0.0.1:$FRONTEND_PORT/" > /dev/null 2>&1; then
    info "Frontend accessible sur http://127.0.0.1:$FRONTEND_PORT"
else
    error "Frontend non accessible. Vérifiez les logs: /tmp/frontend-user-pf.log"
    exit 1
fi

# Test de connexion API
step "Test de l'API de connexion..."
LOGIN_RESPONSE=$(curl -s -m 10 -X POST "http://127.0.0.1:$API_GATEWAY_PORT/auth/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vika-game.com","password":"admin"}')

if echo "$LOGIN_RESPONSE" | jq -e '.token' > /dev/null 2>&1; then
    info "Login API fonctionne correctement"
else
    warn "Login API retourne une erreur:"
    echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
fi

echo ""
info "=== PORT-FORWARDS ACTIFS ==="
echo ""
echo "✅ API Gateway: http://127.0.0.1:$API_GATEWAY_PORT"
echo "✅ Frontend User: http://127.0.0.1:$FRONTEND_PORT"
echo ""
info "=== CREDENTIALS POUR /user/login ==="
echo ""
echo "   URL: http://127.0.0.1:$FRONTEND_PORT/user/login"
echo "   Email: admin@vika-game.com"
echo "   Password: admin"
echo ""
warn "⚠️  Les port-forwards sont actifs. Pour les arrêter:"
echo "   kill $API_GATEWAY_PID $FRONTEND_PID"
echo ""

# Attendre indéfiniment pour garder les port-forwards actifs
wait

