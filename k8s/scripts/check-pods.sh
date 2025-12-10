#!/bin/bash

# Script pour vérifier l'état de tous les pods dans Kubernetes
# Usage: ./k8s/scripts/check-pods.sh [service-name]

set -e

NAMESPACE="intelectgame"
SERVICE_NAME="${1:-}"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔍 Vérification des pods dans le namespace: $NAMESPACE"
echo "=================================================="
echo ""

# Vérifier que le namespace existe
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo -e "${RED}❌ Le namespace '$NAMESPACE' n'existe pas${NC}"
    exit 1
fi

# Si un service spécifique est demandé
if [ -n "$SERVICE_NAME" ]; then
    echo "📦 Vérification du service: $SERVICE_NAME"
    echo ""
    
    # Vérifier les pods du service
    PODS=$(kubectl get pods -n "$NAMESPACE" -l app="$SERVICE_NAME" -o jsonpath='{.items[*].metadata.name}' 2>/dev/null || echo "")
    
    if [ -z "$PODS" ]; then
        echo -e "${YELLOW}⚠️  Aucun pod trouvé pour le service '$SERVICE_NAME'${NC}"
        exit 1
    fi
    
    for pod in $PODS; do
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "${BLUE}📦 Pod: $pod${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        # Statut du pod
        STATUS=$(kubectl get pod "$pod" -n "$NAMESPACE" -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
        READY=$(kubectl get pod "$pod" -n "$NAMESPACE" -o jsonpath='{.status.containerStatuses[0].ready}' 2>/dev/null || echo "false")
        
        if [ "$STATUS" = "Running" ] && [ "$READY" = "true" ]; then
            echo -e "${GREEN}✅ Status: $STATUS (Ready: $READY)${NC}"
        elif [ "$STATUS" = "Pending" ]; then
            echo -e "${YELLOW}⏳ Status: $STATUS${NC}"
        elif [ "$STATUS" = "Error" ] || [ "$STATUS" = "CrashLoopBackOff" ]; then
            echo -e "${RED}❌ Status: $STATUS${NC}"
        else
            echo -e "${YELLOW}⚠️  Status: $STATUS (Ready: $READY)${NC}"
        fi
        
        # Détails du pod
        echo ""
        echo "📋 Détails:"
        kubectl get pod "$pod" -n "$NAMESPACE" -o wide
        
        # Événements récents
        echo ""
        echo "📢 Événements récents:"
        kubectl get events -n "$NAMESPACE" --field-selector involvedObject.name="$pod" --sort-by='.lastTimestamp' | tail -5 || echo "  Aucun événement"
        
        # Logs (dernières 10 lignes)
        echo ""
        echo "📝 Dernières lignes des logs:"
        kubectl logs "$pod" -n "$NAMESPACE" --tail=10 2>&1 | head -10 || echo "  Impossible de récupérer les logs"
        
        echo ""
    done
    
    exit 0
fi

# Vérifier tous les pods
echo "📊 Liste de tous les pods:"
echo ""
kubectl get pods -n "$NAMESPACE" -o wide

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 Résumé par statut:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Compter les pods par statut
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

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Pods avec problèmes:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Trouver les pods en erreur
ERROR_PODS=$(kubectl get pods -n "$NAMESPACE" -o jsonpath='{.items[?(@.status.phase!="Running" && @.status.phase!="Succeeded")].metadata.name}' 2>/dev/null || echo "")

if [ -z "$ERROR_PODS" ]; then
    echo -e "${GREEN}✅ Tous les pods sont en cours d'exécution${NC}"
else
    echo -e "${RED}❌ Pods avec problèmes:${NC}"
    for pod in $ERROR_PODS; do
        STATUS=$(kubectl get pod "$pod" -n "$NAMESPACE" -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
        REASON=$(kubectl get pod "$pod" -n "$NAMESPACE" -o jsonpath='{.status.containerStatuses[0].state.waiting.reason}' 2>/dev/null || echo "")
        echo -e "  ${RED}  - $pod${NC} (Status: $STATUS${REASON:+ - Reason: $REASON})"
    done
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Services:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl get services -n "$NAMESPACE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 Commandes utiles:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Voir les logs d'un pod:"
echo "  kubectl logs -f <pod-name> -n $NAMESPACE"
echo ""
echo "Voir les logs d'un service:"
echo "  kubectl logs -f -l app=<service-name> -n $NAMESPACE"
echo ""
echo "Décrire un pod (pour voir les événements et erreurs):"
echo "  kubectl describe pod <pod-name> -n $NAMESPACE"
echo ""
echo "Redémarrer un service:"
echo "  kubectl rollout restart deployment/<service-name> -n $NAMESPACE"
echo ""
echo "Vérifier un service spécifique:"
echo "  ./k8s/scripts/check-pods.sh <service-name>"
echo ""
echo "Services disponibles:"
echo "  - auth-service"
echo "  - quiz-service"
echo "  - game-service"
echo "  - api-gateway"
echo "  - frontend"
echo "  - telegram-bot"
echo "  - mongodb"
echo "  - redis"
echo ""

