#!/bin/bash

# Script pour corriger l'accès au frontend

set -e

NAMESPACE="intelectgame"
LOCAL_PORT=5173
REMOTE_PORT=80

echo "🔧 Correction de l'accès au frontend..."
echo ""

# 1. Arrêter les port-forwards existants
echo "--- 1. Nettoyage des port-forwards existants ---"
pkill -f "kubectl port-forward.*5173" 2>/dev/null || true
pkill -f "kubectl port-forward.*nginx-proxy" 2>/dev/null || true
sleep 1
echo "✅ Nettoyage terminé"
echo ""

# 2. Vérifier que le service existe
echo "--- 2. Vérification du service ---"
if kubectl get svc -n $NAMESPACE nginx-proxy &> /dev/null; then
  SERVICE="nginx-proxy"
  echo "✅ Service trouvé: nginx-proxy"
elif kubectl get svc -n $NAMESPACE -l app=frontend &> /dev/null; then
  SERVICE=$(kubectl get svc -n $NAMESPACE -l app=frontend -o name | head -1 | cut -d/ -f2)
  echo "✅ Service trouvé: $SERVICE"
else
  echo "❌ Aucun service frontend trouvé"
  exit 1
fi
echo ""

# 3. Vérifier que le pod est prêt
echo "--- 3. Vérification du pod ---"
if [ "$SERVICE" = "nginx-proxy" ]; then
  POD_LABEL="app=nginx-proxy"
else
  POD_LABEL="app=frontend"
fi

if ! kubectl get pods -n $NAMESPACE -l $POD_LABEL | grep -q Running; then
  echo "⚠️  Aucun pod en cours d'exécution. Attente..."
  kubectl wait --for=condition=ready pod -l $POD_LABEL -n $NAMESPACE --timeout=120s || {
    echo "❌ Le pod ne démarre pas"
    kubectl get pods -n $NAMESPACE -l $POD_LABEL
    exit 1
  }
fi
echo "✅ Pod prêt"
echo ""

# 4. Créer le port-forward
echo "--- 4. Création du port-forward ---"
echo "   Local:  http://localhost:$LOCAL_PORT"
echo "   Remote: $SERVICE:$REMOTE_PORT"
echo ""
echo "💡 Le port-forward est lancé en arrière-plan"
echo "💡 Pour voir les logs: tail -f /tmp/frontend-port-forward.log"
echo ""

# Démarrer le port-forward en arrière-plan
kubectl port-forward -n $NAMESPACE service/$SERVICE $LOCAL_PORT:$REMOTE_PORT > /tmp/frontend-port-forward.log 2>&1 &
PORT_FORWARD_PID=$!

# Attendre un peu pour que le port-forward démarre
sleep 3

# Vérifier que le processus est toujours actif
if ps -p $PORT_FORWARD_PID > /dev/null; then
  echo "✅ Port-forward démarré (PID: $PORT_FORWARD_PID)"
else
  echo "❌ Le port-forward n'a pas démarré correctement"
  echo "📋 Logs:"
  cat /tmp/frontend-port-forward.log
  exit 1
fi
echo ""

# 5. Tester la connexion
echo "--- 5. Test de connexion ---"
if curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:$LOCAL_PORT/; then
  echo "✅ Frontend accessible sur http://localhost:$LOCAL_PORT"
else
  echo "⚠️  La connexion a échoué, mais le port-forward est actif"
  echo "💡 Essayez d'ouvrir http://localhost:$LOCAL_PORT dans votre navigateur"
fi
echo ""

echo "✅ Correction terminée!"
echo ""
echo "📋 Commandes utiles:"
echo "   # Arrêter le port-forward"
echo "   pkill -f 'kubectl port-forward.*nginx-proxy'"
echo ""
echo "   # Voir les logs du port-forward"
echo "   tail -f /tmp/frontend-port-forward.log"
echo ""
echo "   # Redémarrer le port-forward"
echo "   ./k8s/local/scripts/fix-frontend-access.sh"

