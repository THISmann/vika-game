#!/bin/bash

# Script pour vérifier les logs des services et diagnostiquer les erreurs
# Usage: ./check-service-logs.sh [namespace]

NAMESPACE="${1:-intelectgame}"

echo "🔍 Vérification des logs des services"
echo "📍 Namespace: $NAMESPACE"
echo ""

# Couleurs
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

check_service() {
  local service=$1
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 Service: $service"
  
  if ! kubectl get deployment -n "$NAMESPACE" "$service" &>/dev/null; then
    echo -e "${RED}❌ Déploiement $service non trouvé${NC}"
    return 1
  fi
  
  # Statut des pods
  echo "   Pods:"
  kubectl get pods -n "$NAMESPACE" -l app="$service" 2>/dev/null || echo "   (aucun pod trouvé)"
  
  # Derniers logs (erreurs)
  echo ""
  echo "   Dernières erreurs dans les logs:"
  PODS=$(kubectl get pods -n "$NAMESPACE" -l app="$service" -o jsonpath='{.items[*].metadata.name}' 2>/dev/null)
  
  if [ -z "$PODS" ]; then
    echo -e "${RED}   ❌ Aucun pod trouvé${NC}"
    return 1
  fi
  
  for pod in $PODS; do
    echo "   ── Pod: $pod ──"
    ERRORS=$(kubectl logs -n "$NAMESPACE" "$pod" --tail=50 2>/dev/null | grep -i "error\|fail\|exception" | tail -5 || echo "")
    if [ -n "$ERRORS" ]; then
      echo -e "${RED}$ERRORS${NC}"
    else
      echo -e "${GREEN}   ✅ Aucune erreur récente${NC}"
    fi
    
    # Vérifier MongoDB connection
    if [ "$service" != "mongodb" ]; then
      MONGODB_LOG=$(kubectl logs -n "$NAMESPACE" "$pod" --tail=100 2>/dev/null | grep -i "mongodb\|mongoose" | tail -3 || echo "")
      if [ -n "$MONGODB_LOG" ]; then
        echo "   MongoDB connection:"
        echo "$MONGODB_LOG"
      fi
    fi
  done
  
  echo ""
}

# Vérifier MongoDB
echo "═══════════════════════════════════════════════════════════"
echo "🐳 MONGODB"
echo "═══════════════════════════════════════════════════════════"
check_service "mongodb"

# Vérifier les micro-services
echo "═══════════════════════════════════════════════════════════"
echo "🔧 MICRO-SERVICES"
echo "═══════════════════════════════════════════════════════════"

check_service "auth-service"
check_service "quiz-service"
check_service "game-service"

# Vérifier le frontend
echo "═══════════════════════════════════════════════════════════"
echo "🌐 FRONTEND"
echo "═══════════════════════════════════════════════════════════"
check_service "frontend"

# Vérifier Nginx proxy
echo "═══════════════════════════════════════════════════════════"
echo "🔀 NGINX PROXY"
echo "═══════════════════════════════════════════════════════════"
if kubectl get deployment -n "$NAMESPACE" nginx-proxy &>/dev/null; then
  check_service "nginx-proxy"
else
  echo "⚠️  Nginx proxy non déployé"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "💡 Commandes utiles"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Voir tous les logs d'un service:"
echo "  kubectl logs -n $NAMESPACE deployment/quiz-service --tail=100"
echo ""
echo "Suivre les logs en temps réel:"
echo "  kubectl logs -n $NAMESPACE deployment/quiz-service -f"
echo ""
echo "Voir les événements:"
echo "  kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp'"
echo ""
echo "Décrire un pod pour voir les erreurs:"
echo "  kubectl describe pod -n $NAMESPACE <pod-name>"

