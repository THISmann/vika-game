#!/bin/bash

# Script pour accéder à Prometheus

set -e

NAMESPACE="monitoring"
SERVICE="prometheus"
LOCAL_PORT=9090
REMOTE_PORT=9090

echo "📈 Accès à Prometheus..."
echo ""

# Vérifier que le service existe
if ! kubectl get service $SERVICE -n $NAMESPACE &> /dev/null; then
  echo "❌ Service $SERVICE n'existe pas dans le namespace $NAMESPACE"
  echo "💡 Déployez la stack avec: ./k8s/local/scripts/deploy-loki-stack.sh"
  exit 1
fi

# Vérifier que le pod est prêt
if ! kubectl get pods -n $NAMESPACE -l app=$SERVICE | grep -q Running; then
  echo "⚠️  Aucun pod Prometheus en cours d'exécution. Attente..."
  kubectl wait --for=condition=ready pod -l app=$SERVICE -n $NAMESPACE --timeout=120s || {
    echo "❌ Le pod ne démarre pas"
    exit 1
  }
fi

# Arrêter les port-forwards existants
echo "🧹 Nettoyage des port-forwards existants..."
pkill -f "kubectl port-forward.*prometheus.*9090" 2>/dev/null || true
sleep 1

echo "✅ Service trouvé"
echo ""
echo "📡 Création du port-forward..."
echo "   Local:  http://localhost:$LOCAL_PORT"
echo "   Remote: $SERVICE:$REMOTE_PORT"
echo ""
echo "💡 Fonctionnalités Prometheus:"
echo "   - Graph: Requêtes PromQL"
echo "   - Status > Targets: Vérifier les endpoints scrapés"
echo "   - Status > Configuration: Voir la configuration"
echo "   - Alerts: Gérer les alertes (si configurées)"
echo ""
echo "💡 Requêtes PromQL utiles:"
echo "   - container_cpu_usage_seconds_total"
echo "   - container_memory_usage_bytes"
echo "   - rate(container_cpu_usage_seconds_total[5m])"
echo ""
echo "💡 Appuyez sur Ctrl+C pour arrêter le port-forward"
echo ""

# Créer le port-forward
kubectl port-forward -n $NAMESPACE service/$SERVICE $LOCAL_PORT:$REMOTE_PORT

