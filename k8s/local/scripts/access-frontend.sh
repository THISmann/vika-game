#!/bin/bash

# Script pour accéder au frontend en local

set -e

NAMESPACE="intelectgame"
SERVICE="frontend"
LOCAL_PORT=5173
REMOTE_PORT=5173

echo "🌐 Accès au frontend en local..."
echo ""

# Vérifier que le service existe
if ! kubectl get service $SERVICE -n $NAMESPACE &> /dev/null; then
  echo "❌ Service $SERVICE n'existe pas dans le namespace $NAMESPACE"
  exit 1
fi

# Vérifier que le pod est prêt
if ! kubectl get pods -n $NAMESPACE -l app=$SERVICE | grep -q Running; then
  echo "⚠️  Aucun pod frontend en cours d'exécution. Attente..."
  kubectl wait --for=condition=ready pod -l app=$SERVICE -n $NAMESPACE --timeout=60s
fi

echo "✅ Service trouvé"
echo ""
echo "📡 Création du port-forward..."
echo "   Local:  http://localhost:$LOCAL_PORT"
echo "   Remote: $SERVICE:$REMOTE_PORT"
echo ""
echo "💡 Appuyez sur Ctrl+C pour arrêter le port-forward"
echo ""

# Créer le port-forward
kubectl port-forward -n $NAMESPACE service/$SERVICE $LOCAL_PORT:$REMOTE_PORT

