#!/bin/bash

# Script pour tester la connexion admin avec port-forward
# Usage: ./k8s/scripts/test-admin-login.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Démarrer les port-forwards
info "Démarrage des port-forwards..."

# Port-forward pour API Gateway
kubectl port-forward -n intelectgame svc/api-gateway 3000:3000 > /tmp/api-gateway-pf.log 2>&1 &
API_GATEWAY_PID=$!
sleep 2

# Port-forward pour Admin Frontend
kubectl port-forward -n intelectgame svc/admin-frontend 5174:80 > /tmp/admin-frontend-pf.log 2>&1 &
ADMIN_FRONTEND_PID=$!
sleep 2

info "Port-forwards démarrés:"
echo "   API Gateway: http://127.0.0.1:3000"
echo "   Admin Frontend: http://127.0.0.1:5174"
echo ""

# Tester la connexion admin
info "Test de la connexion admin..."
echo "Credentials: admin / admin"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "http://127.0.0.1:3000/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    info "✅ Connexion admin réussie!"
    echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
    echo ""
    info "✅ Frontend Admin accessible sur: http://127.0.0.1:5174/admin/login"
    echo ""
    echo "Vous pouvez maintenant vous connecter avec:"
    echo "   Username: admin"
    echo "   Password: admin"
else
    error "❌ Échec de la connexion admin"
    echo "Réponse: $LOGIN_RESPONSE"
fi

# Fonction de nettoyage
cleanup() {
    info "Arrêt des port-forwards..."
    kill $API_GATEWAY_PID 2>/dev/null || true
    kill $ADMIN_FRONTEND_PID 2>/dev/null || true
    pkill -f "kubectl port-forward.*api-gateway" || true
    pkill -f "kubectl port-forward.*admin-frontend" || true
}

# Attendre Ctrl+C
trap cleanup EXIT INT TERM

info "Port-forwards actifs. Appuyez sur Ctrl+C pour arrêter."
info "Accédez au frontend admin: http://127.0.0.1:5174/admin/login"
echo ""

# Attendre indéfiniment
wait

