#!/bin/bash

# Script pour démarrer les port-forwards nécessaires pour les frontends
# Usage: ./k8s/scripts/start-port-forwards.sh

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

# Nettoyer les port-forwards existants
info "Nettoyage des port-forwards existants..."
pkill -f "kubectl port-forward.*api-gateway" 2>/dev/null || true
pkill -f "kubectl port-forward.*frontend" 2>/dev/null || true
pkill -f "kubectl port-forward.*admin-frontend" 2>/dev/null || true
sleep 2

# Démarrer port-forwards
step "Démarrage des port-forwards..."
kubectl port-forward -n "$NAMESPACE" svc/api-gateway 3000:3000 > /tmp/api-gateway-pf.log 2>&1 &
API_GATEWAY_PID=$!
kubectl port-forward -n "$NAMESPACE" svc/frontend 64802:80 > /tmp/frontend-pf.log 2>&1 &
FRONTEND_PID=$!
kubectl port-forward -n "$NAMESPACE" svc/admin-frontend 57958:80 > /tmp/admin-frontend-pf.log 2>&1 &
ADMIN_FRONTEND_PID=$!

sleep 5

info "Port-forwards démarrés. Attente de 5 secondes pour stabilisation..."
sleep 5

echo ""
step "=== VÉRIFICATION DES PORT-FORWARDS ==="
echo ""

# Test API Gateway
step "1. Test API Gateway (port 3000):"
HEALTH_RESPONSE=$(curl -s -m 10 "http://127.0.0.1:3000/health")
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    info "   ✅ API Gateway accessible"
else
    error "   ❌ API Gateway non accessible"
    echo "$HEALTH_RESPONSE"
    exit 1
fi

# Test Frontend User
step "2. Test Frontend User (port 64802):"
if curl -s -m 5 -o /dev/null -w "%{http_code}" "http://127.0.0.1:64802/" | grep -q "200"; then
    info "   ✅ Frontend User accessible"
else
    warn "   ⚠️  Frontend User pourrait ne pas être accessible"
fi

# Test Admin Frontend
step "3. Test Admin Frontend (port 57958):"
if curl -s -m 5 -o /dev/null -w "%{http_code}" "http://127.0.0.1:57958/" | grep -q "200"; then
    info "   ✅ Admin Frontend accessible"
else
    warn "   ⚠️  Admin Frontend pourrait ne pas être accessible"
fi

echo ""
info "=== ✅ PORT-FORWARDS ACTIFS ==="
echo ""
echo "🌐 ACCÈS:"
echo "   Frontend User: http://127.0.0.1:64802/user/login"
echo "   Admin Frontend: http://127.0.0.1:57958/admin/login"
echo "   API Gateway: http://127.0.0.1:3000"
echo ""
echo "📋 CREDENTIALS:"
echo "   Frontend User:"
echo "     Email: user@vika-game.com"
echo "     Password: user123"
echo ""
echo "   Admin Frontend:"
echo "     Username: admin"
echo "     Password: admin"
echo ""
info "Port-forwards actifs. Appuyez sur Ctrl+C pour arrêter."
wait $API_GATEWAY_PID $FRONTEND_PID $ADMIN_FRONTEND_PID

