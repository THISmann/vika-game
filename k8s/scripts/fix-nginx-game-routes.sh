#!/bin/bash

# Script pour corriger le routage Nginx pour /api/game/*

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔧 Correction du routage Nginx pour /api/game/*"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

NAMESPACE="intelectgame"

# Vérifier que kubectl est disponible
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl n'est pas installé${NC}"
    exit 1
fi

# Vérifier que le namespace existe
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo -e "${RED}❌ Le namespace $NAMESPACE n'existe pas${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Étape 1: Appliquer la nouvelle configuration Nginx...${NC}"
kubectl apply -f k8s/nginx-proxy-config.yaml -n "$NAMESPACE"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de l'application de la configuration${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Configuration appliquée${NC}"
echo ""

echo -e "${BLUE}📋 Étape 2: Redémarrer le pod nginx-proxy...${NC}"
kubectl rollout restart deployment/nginx-proxy -n "$NAMESPACE"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors du redémarrage${NC}"
    exit 1
fi

echo -e "${BLUE}⏳ Attente que le pod soit prêt (30 secondes)...${NC}"
kubectl rollout status deployment/nginx-proxy -n "$NAMESPACE" --timeout=60s

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Le pod n'est pas encore prêt, mais la configuration est appliquée${NC}"
fi

echo ""
echo -e "${BLUE}📋 Étape 3: Vérification des pods...${NC}"
kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy

echo ""
echo -e "${BLUE}📋 Étape 4: Test des endpoints (depuis le pod nginx-proxy)...${NC}"

# Attendre un peu pour que le pod soit complètement démarré
sleep 5

# Tester depuis l'intérieur du cluster
NGINX_POD=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}')

if [ -n "$NGINX_POD" ]; then
    echo -e "${BLUE}Test depuis le pod: $NGINX_POD${NC}"
    
    # Test 1: /api/game/state
    echo -n "  Test /api/game/state... "
    RESULT=$(kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- wget -qO- http://localhost/api/game/state 2>&1)
    if echo "$RESULT" | grep -q "gameCode\|isStarted"; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ ÉCHEC${NC}"
        echo "   Réponse: $RESULT"
    fi
    
    # Test 2: /api/game/players/count
    echo -n "  Test /api/game/players/count... "
    RESULT=$(kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- wget -qO- http://localhost/api/game/players/count 2>&1)
    if echo "$RESULT" | grep -q "count"; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ ÉCHEC${NC}"
        echo "   Réponse: $RESULT"
    fi
else
    echo -e "${YELLOW}⚠️  Pod nginx-proxy non trouvé${NC}"
fi

echo ""
echo -e "${GREEN}✅ Correction terminée !${NC}"
echo ""
echo "📋 PROCHAINES ÉTAPES :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Vérifier les logs Nginx :"
echo "   kubectl logs -f deployment/nginx-proxy -n $NAMESPACE"
echo ""
echo "2. Tester depuis l'extérieur (si le port est ouvert) :"
echo "   curl http://82.202.141.248:30081/api/game/state"
echo ""
echo "3. Vérifier dans le frontend que les erreurs 404 ont disparu"
echo ""
echo "💡 NOTE : Les erreurs 'ServiceWorker is not defined' et 'single-player.bundle.js'"
echo "   sont des warnings de développement et ne bloquent pas l'application."

