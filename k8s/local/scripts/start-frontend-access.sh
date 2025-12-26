#!/bin/bash

# Script pour démarrer l'accès au frontend via port-forward

set -e

NAMESPACE="intelectgame"
SERVICE="nginx-proxy"
LOCAL_PORT=5173
REMOTE_PORT=80

echo "🌐 Démarrage de l'accès au frontend..."
echo ""

# Arrêter les port-forwards existants
echo "🧹 Nettoyage des port-forwards existants..."
pkill -f "kubectl port-forward.*nginx-proxy" 2>/dev/null || true
sleep 1

# Vérifier que le service existe
if ! kubectl get service $SERVICE -n $NAMESPACE &> /dev/null; then
  echo "❌ Service $SERVICE n'existe pas dans le namespace $NAMESPACE"
  exit 1
fi

# Vérifier que le pod est prêt
if ! kubectl get pods -n $NAMESPACE -l app=$SERVICE | grep -q Running; then
  echo "⚠️  Aucun pod $SERVICE en cours d'exécution. Attente..."
  kubectl wait --for=condition=ready pod -l app=$SERVICE -n $NAMESPACE --timeout=60s
fi

echo "✅ Service trouvé"
echo ""
echo "📡 Création du port-forward..."
echo "   Local:  http://localhost:$LOCAL_PORT"
echo "   Remote: $SERVICE:$REMOTE_PORT"
echo ""

# Créer le port-forward en arrière-plan
kubectl port-forward -n $NAMESPACE service/$SERVICE $LOCAL_PORT:$REMOTE_PORT > /tmp/nginx-port-forward.log 2>&1 &
PORT_FORWARD_PID=$!

# Attendre un peu pour vérifier que ça fonctionne
sleep 2

if ps -p $PORT_FORWARD_PID > /dev/null; then
  echo "✅ Port-forward démarré (PID: $PORT_FORWARD_PID)"
  echo ""
  echo "🌐 Frontend accessible sur: http://localhost:$LOCAL_PORT"
  echo ""
  echo "💡 Pour arrêter le port-forward:"
  echo "   kill $PORT_FORWARD_PID"
  echo "   ou: pkill -f 'kubectl port-forward.*nginx-proxy'"
else
  echo "❌ Échec du démarrage du port-forward"
  echo "📋 Logs:"
  cat /tmp/nginx-port-forward.log
  exit 1
fi

