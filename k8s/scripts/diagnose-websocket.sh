#!/bin/bash

echo "🔍 Diagnostic WebSocket Socket.io"
echo "=================================="
echo ""

# 1. Vérifier la configuration Nginx
echo "1. Configuration Nginx pour /socket.io"
echo "---------------------------------------"
kubectl get configmap nginx-proxy-config -n intelectgame -o yaml | grep -A 20 "location /socket.io" || echo "❌ ConfigMap non trouvé"
echo ""

# 2. Vérifier les logs Nginx
echo "2. Derniers logs Nginx (erreurs WebSocket)"
echo "-------------------------------------------"
kubectl logs -n intelectgame -l app=nginx-proxy --tail=50 | grep -i "socket\|websocket\|400\|502" || echo "Aucune erreur récente"
echo ""

# 3. Vérifier les logs game-service
echo "3. Derniers logs game-service (connexions WebSocket)"
echo "----------------------------------------------------"
kubectl logs -n intelectgame -l app=game-service --tail=50 | grep -i "websocket\|socket\|connect\|register" || echo "Aucune connexion récente"
echo ""

# 4. Vérifier le service game-service
echo "4. Service game-service"
echo "-----------------------"
kubectl get service game-service -n intelectgame
echo ""

# 5. Tester la connexion depuis un pod
echo "5. Test de connexion depuis un pod"
echo "----------------------------------"
POD=$(kubectl get pods -n intelectgame -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$POD" ]; then
  echo "Test depuis pod: $POD"
  kubectl exec -n intelectgame $POD -- curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://game-service.intelectgame.svc.cluster.local:3003/socket.io/ || echo "❌ Connexion échouée"
else
  echo "❌ Aucun pod nginx-proxy trouvé"
fi
echo ""

# 6. Vérifier les événements Kubernetes
echo "6. Événements récents (erreurs)"
echo "--------------------------------"
kubectl get events -n intelectgame --sort-by='.lastTimestamp' | tail -10
echo ""

echo "✅ Diagnostic terminé"
echo ""
echo "📝 Pour tester manuellement :"
echo "   1. Ouvrir la console du navigateur (F12)"
echo "   2. Vérifier l'URL utilisée pour WebSocket dans les logs"
echo "   3. Vérifier les erreurs dans la console"
echo ""
echo "🔧 Commandes utiles :"
echo "   kubectl logs -f -n intelectgame -l app=nginx-proxy"
echo "   kubectl logs -f -n intelectgame -l app=game-service"
echo "   kubectl describe service nginx-proxy -n intelectgame"

