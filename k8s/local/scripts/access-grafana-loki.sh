#!/bin/bash

# Script pour accéder à Grafana (stack Loki)

set -e

NAMESPACE="monitoring"
SERVICE="grafana"
LOCAL_PORT=3000
REMOTE_PORT=3000

echo "📊 Accès à Grafana (Loki Stack)..."
echo ""

# Vérifier que le service existe
if ! kubectl get service $SERVICE -n $NAMESPACE &> /dev/null; then
  echo "❌ Service $SERVICE n'existe pas dans le namespace $NAMESPACE"
  echo "💡 Déployez la stack avec: ./k8s/local/scripts/deploy-loki-stack.sh"
  exit 1
fi

# Vérifier que le pod est prêt
if ! kubectl get pods -n $NAMESPACE -l app=$SERVICE | grep -q Running; then
  echo "⚠️  Aucun pod Grafana en cours d'exécution. Attente..."
  kubectl wait --for=condition=ready pod -l app=$SERVICE -n $NAMESPACE --timeout=120s || {
    echo "❌ Le pod ne démarre pas"
    exit 1
  }
fi

# Arrêter les port-forwards existants
echo "🧹 Nettoyage des port-forwards existants..."
pkill -f "kubectl port-forward.*grafana.*3000" 2>/dev/null || true
sleep 1

echo "✅ Service trouvé"
echo ""
echo "📡 Création du port-forward..."
echo "   Local:  http://localhost:$LOCAL_PORT"
echo "   Remote: $SERVICE:$REMOTE_PORT"
echo ""
echo "🔑 Credentials:"
echo "   Username: admin"
echo "   Password: admin"
echo ""
echo "💡 Dashboards disponibles:"
echo "   - Logs Overview - Microservices"
echo "   - Error Logs"
echo "   - Logs Rate by Service"
echo "   - Error Rate by Service"
echo ""
echo "💡 Datasources pré-configurées:"
echo "   - Loki (logs)"
echo "   - Prometheus (métriques)"
echo ""
echo "💡 Appuyez sur Ctrl+C pour arrêter le port-forward"
echo ""

# Créer le port-forward
kubectl port-forward -n $NAMESPACE service/$SERVICE $LOCAL_PORT:$REMOTE_PORT

