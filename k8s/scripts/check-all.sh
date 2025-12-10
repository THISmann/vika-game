#!/bin/bash

# Script complet pour vérifier l'état de tous les services Kubernetes
# Usage: ./k8s/scripts/check-all.sh

set -e

NAMESPACE="intelectgame"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔍 Vérification complète de l'application"
echo "=================================================="
echo ""

# 1. Vérifier le namespace
echo "📦 1. Vérification du namespace..."
if kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo -e "${GREEN}✅ Namespace '$NAMESPACE' existe${NC}"
else
    echo -e "${RED}❌ Namespace '$NAMESPACE' n'existe pas${NC}"
    exit 1
fi

# 2. Vérifier tous les pods
echo ""
echo "📦 2. État de tous les pods:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl get pods -n "$NAMESPACE" -o wide

# 3. Vérifier les services
echo ""
echo "🌐 3. Services:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl get services -n "$NAMESPACE"

# 4. Vérifier les deployments
echo ""
echo "🚀 4. Deployments:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl get deployments -n "$NAMESPACE"

# 5. Vérifier les ConfigMaps
echo ""
echo "⚙️  5. ConfigMaps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl get configmaps -n "$NAMESPACE"

# 6. Vérifier les Secrets
echo ""
echo "🔐 6. Secrets:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl get secrets -n "$NAMESPACE"

# 7. Résumé des pods par statut
echo ""
echo "📊 7. Résumé des pods:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RUNNING=$(kubectl get pods -n "$NAMESPACE" -o jsonpath='{.items[?(@.status.phase=="Running")].metadata.name}' 2>/dev/null | wc -w | tr -d ' ')
PENDING=$(kubectl get pods -n "$NAMESPACE" -o jsonpath='{.items[?(@.status.phase=="Pending")].metadata.name}' 2>/dev/null | wc -w | tr -d ' ')
FAILED=$(kubectl get pods -n "$NAMESPACE" -o jsonpath='{.items[?(@.status.phase=="Failed")].metadata.name}' 2>/dev/null | wc -w | tr -d ' ')
CRASHLOOP=$(kubectl get pods -n "$NAMESPACE" -o jsonpath='{.items[?(@.status.containerStatuses[0].state.waiting.reason=="CrashLoopBackOff")].metadata.name}' 2>/dev/null | wc -w | tr -d ' ')
TOTAL=$(kubectl get pods -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l | tr -d ' ')

echo -e "${GREEN}✅ Running: $RUNNING${NC}"
echo -e "${YELLOW}⏳ Pending: $PENDING${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
if [ "$CRASHLOOP" -gt 0 ]; then
    echo -e "${RED}🔄 CrashLoopBackOff: $CRASHLOOP${NC}"
fi
echo -e "${BLUE}📦 Total: $TOTAL${NC}"

# 8. Vérifier les pods en erreur
echo ""
echo "🔍 8. Pods avec problèmes:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ERROR_PODS=$(kubectl get pods -n "$NAMESPACE" -o jsonpath='{.items[?(@.status.phase!="Running" && @.status.phase!="Succeeded")].metadata.name}' 2>/dev/null || echo "")

if [ -z "$ERROR_PODS" ]; then
    echo -e "${GREEN}✅ Tous les pods sont en cours d'exécution${NC}"
else
    echo -e "${RED}❌ Pods avec problèmes:${NC}"
    for pod in $ERROR_PODS; do
        STATUS=$(kubectl get pod "$pod" -n "$NAMESPACE" -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
        REASON=$(kubectl get pod "$pod" -n "$NAMESPACE" -o jsonpath='{.status.containerStatuses[0].state.waiting.reason}' 2>/dev/null || echo "")
        RESTARTS=$(kubectl get pod "$pod" -n "$NAMESPACE" -o jsonpath='{.status.containerStatuses[0].restartCount}' 2>/dev/null || echo "0")
        echo -e "  ${RED}  - $pod${NC}"
        echo "      Status: $STATUS${REASON:+ - Reason: $REASON} - Restarts: $RESTARTS"
        
        # Afficher les dernières lignes des logs pour les pods en erreur
        echo "      Dernières lignes des logs:"
        kubectl logs "$pod" -n "$NAMESPACE" --tail=5 2>&1 | sed 's/^/        /' || echo "        Impossible de récupérer les logs"
        echo ""
    done
fi

# 9. Vérifier l'accès aux services
echo ""
echo "🌐 9. Test de connectivité des services:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test API Gateway
API_GATEWAY_POD=$(kubectl get pods -n "$NAMESPACE" -l app=api-gateway -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$API_GATEWAY_POD" ]; then
    if kubectl exec -n "$NAMESPACE" "$API_GATEWAY_POD" -- curl -s http://localhost:3000/health &> /dev/null; then
        echo -e "${GREEN}✅ API Gateway: Accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  API Gateway: Ne répond pas${NC}"
    fi
else
    echo -e "${RED}❌ API Gateway: Pod non trouvé${NC}"
fi

# Test Auth Service
AUTH_POD=$(kubectl get pods -n "$NAMESPACE" -l app=auth-service -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$AUTH_POD" ]; then
    echo -e "${GREEN}✅ Auth Service: Pod trouvé ($AUTH_POD)${NC}"
else
    echo -e "${RED}❌ Auth Service: Pod non trouvé${NC}"
fi

# Test Quiz Service
QUIZ_POD=$(kubectl get pods -n "$NAMESPACE" -l app=quiz-service -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$QUIZ_POD" ]; then
    echo -e "${GREEN}✅ Quiz Service: Pod trouvé ($QUIZ_POD)${NC}"
else
    echo -e "${RED}❌ Quiz Service: Pod non trouvé${NC}"
fi

# Test Game Service
GAME_POD=$(kubectl get pods -n "$NAMESPACE" -l app=game-service -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$GAME_POD" ]; then
    echo -e "${GREEN}✅ Game Service: Pod trouvé ($GAME_POD)${NC}"
else
    echo -e "${RED}❌ Game Service: Pod non trouvé${NC}"
fi

# Test Frontend
FRONTEND_POD=$(kubectl get pods -n "$NAMESPACE" -l app=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$FRONTEND_POD" ]; then
    echo -e "${GREEN}✅ Frontend: Pod trouvé ($FRONTEND_POD)${NC}"
else
    echo -e "${RED}❌ Frontend: Pod non trouvé${NC}"
fi

# 10. Informations d'accès
echo ""
echo "🔗 10. Accès à l'application:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v minikube &> /dev/null; then
    MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "")
    if [ -n "$MINIKUBE_IP" ]; then
        FRONTEND_PORT=$(kubectl get service frontend -n "$NAMESPACE" -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "30080")
        echo "Frontend: http://${MINIKUBE_IP}:${FRONTEND_PORT}"
    fi
fi

echo ""
echo "💡 Commandes utiles:"
echo "  ./k8s/scripts/check-pods.sh              - Vérifier tous les pods"
echo "  ./k8s/scripts/check-pods.sh <service>     - Vérifier un service spécifique"
echo "  kubectl logs -f <pod-name> -n $NAMESPACE - Voir les logs en temps réel"
echo "  kubectl describe pod <pod-name> -n $NAMESPACE - Détails d'un pod"
echo ""

