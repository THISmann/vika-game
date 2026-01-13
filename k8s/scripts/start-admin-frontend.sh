#!/bin/bash

# Script pour démarrer le frontend admin avec port-forward
# Usage: ./k8s/scripts/start-admin-frontend.sh

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

# Vérifier que Minikube est démarré
if ! minikube status &> /dev/null; then
    error "Minikube n'est pas démarré. Démarrez Minikube d'abord."
    exit 1
fi

# Nettoyer les port-forwards existants
info "Nettoyage des port-forwards existants..."
pkill -f "kubectl port-forward.*api-gateway" 2>/dev/null || true
pkill -f "kubectl port-forward.*admin-frontend" 2>/dev/null || true
sleep 2

# Démarrer port-forward pour API Gateway
step "Démarrage du port-forward pour API Gateway (port 3000)..."
kubectl port-forward -n intelectgame svc/api-gateway 3000:3000 > /tmp/api-gateway-pf.log 2>&1 &
API_GATEWAY_PID=$!
sleep 3

# Vérifier que le port-forward fonctionne
if ! kill -0 $API_GATEWAY_PID 2>/dev/null; then
    error "Échec du démarrage du port-forward pour API Gateway"
    exit 1
fi

info "API Gateway accessible sur http://127.0.0.1:3000"

# Démarrer port-forward pour Admin Frontend
step "Démarrage du port-forward pour Admin Frontend (port 5174)..."
kubectl port-forward -n intelectgame svc/admin-frontend 5174:80 > /tmp/admin-frontend-pf.log 2>&1 &
ADMIN_FRONTEND_PID=$!
sleep 3

# Vérifier que le port-forward fonctionne
if ! kill -0 $ADMIN_FRONTEND_PID 2>/dev/null; then
    error "Échec du démarrage du port-forward pour Admin Frontend"
    kill $API_GATEWAY_PID 2>/dev/null || true
    exit 1
fi

info "Admin Frontend accessible sur http://127.0.0.1:5174"

# Tester la connexion admin
step "Test de la connexion admin..."
sleep 2

LOGIN_RESPONSE=$(curl -s -X POST "http://127.0.0.1:3000/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    info "✅ Connexion admin testée avec succès!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    info "🌐 FRONTEND ADMIN ACCESSIBLE:"
    echo "   URL: http://127.0.0.1:5174/admin/login"
    echo ""
    info "🔑 CREDENTIALS:"
    echo "   Username: admin"
    echo "   Password: admin"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    warn "⚠️  Les port-forwards sont actifs. Ne fermez pas ce terminal."
    warn "   Pour arrêter: Appuyez sur Ctrl+C"
    echo ""
else
    error "❌ Échec du test de connexion admin"
    echo "Réponse: $LOGIN_RESPONSE"
    echo ""
    warn "Les port-forwards sont démarrés mais le test a échoué."
    warn "Vérifiez les logs dans /tmp/api-gateway-pf.log et /tmp/admin-frontend-pf.log"
fi

# Fonction de nettoyage
cleanup() {
    echo ""
    info "Arrêt des port-forwards..."
    kill $API_GATEWAY_PID 2>/dev/null || true
    kill $ADMIN_FRONTEND_PID 2>/dev/null || true
    pkill -f "kubectl port-forward.*api-gateway" 2>/dev/null || true
    pkill -f "kubectl port-forward.*admin-frontend" 2>/dev/null || true
    info "Port-forwards arrêtés."
    exit 0
}

# Capturer Ctrl+C
trap cleanup EXIT INT TERM

# Attendre indéfiniment
info "Port-forwards actifs. En attente..."
wait

