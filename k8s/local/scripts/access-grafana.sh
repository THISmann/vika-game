#!/bin/bash

# Script pour accéder à Grafana

set -e

NAMESPACE="monitoring"
SERVICE="grafana"
LOCAL_PORT=3000
REMOTE_PORT=3000

echo "📊 Accès au dashboard Grafana..."
echo ""

# Vérifier que le service existe
if ! kubectl get service $SERVICE -n $NAMESPACE &> /dev/null; then
  echo "❌ Service $SERVICE n'existe pas dans le namespace $NAMESPACE"
  echo "💡 Déployez Grafana avec: helm upgrade --install monitoring ./k8s/local/helm/monitoring -n monitoring --create-namespace"
  exit 1
fi

# Vérifier que le pod est prêt
if ! kubectl get pods -n $NAMESPACE -l app=$SERVICE | grep -q Running; then
  echo "⚠️  Aucun pod $SERVICE en cours d'exécution. Attente..."
  kubectl wait --for=condition=ready pod -l app=$SERVICE -n $NAMESPACE --timeout=60s
fi

# Obtenir les credentials depuis values.yaml ou utiliser les valeurs par défaut
ADMIN_USER=$(kubectl get deployment grafana -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].env[?(@.name=="GF_SECURITY_ADMIN_USER")].value}' 2>/dev/null || echo "admin")
ADMIN_PASSWORD=$(kubectl get deployment grafana -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].env[?(@.name=="GF_SECURITY_ADMIN_PASSWORD")].value}' 2>/dev/null || echo "admin")

echo "✅ Service trouvé"
echo ""
echo "📡 Création du port-forward..."
echo "   Local:  http://localhost:$LOCAL_PORT"
echo "   Remote: $SERVICE:$REMOTE_PORT"
echo ""
echo "🔐 Credentials:"
echo "   Username: $ADMIN_USER"
echo "   Password: $ADMIN_PASSWORD"
echo ""
echo "💡 Appuyez sur Ctrl+C pour arrêter le port-forward"
echo ""

# Créer le port-forward
kubectl port-forward -n $NAMESPACE service/$SERVICE $LOCAL_PORT:$REMOTE_PORT

