#!/bin/bash

# Script de diagnostic pour l'erreur 401 lors du démarrage du jeu

NAMESPACE="intelectgame"
GAME_SERVICE_LABEL="game-service"
QUIZ_SERVICE_LABEL="quiz-service"
NGINX_DEPLOYMENT="nginx-proxy"

echo "🔬 Diagnostic de l'erreur 401 lors du démarrage du jeu..."
echo ""

# 1. Vérifier les logs du game-service pour les requêtes START GAME
echo "--- 1. Logs du game-service (START GAME REQUEST) ---"
GAME_POD=$(kubectl get pods -n $NAMESPACE -l app=$GAME_SERVICE_LABEL -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$GAME_POD" ]; then
  echo "Pod game-service: $GAME_POD"
  echo ""
  echo "Dernières requêtes START GAME:"
  kubectl logs $GAME_POD -n $NAMESPACE --tail=200 | grep -A 30 "START GAME REQUEST" | tail -n 50
else
  echo "❌ Aucun pod game-service trouvé."
fi

echo ""
echo "--- 2. Logs du quiz-service (AUTHENTICATION) ---"
QUIZ_POD=$(kubectl get pods -n $NAMESPACE -l app=$QUIZ_SERVICE_LABEL -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$QUIZ_POD" ]; then
  echo "Pod quiz-service: $QUIZ_POD"
  echo ""
  echo "Dernières requêtes d'authentification:"
  kubectl logs $QUIZ_POD -n $NAMESPACE --tail=200 | grep -A 20 "AUTHENTICATION" | tail -n 40
else
  echo "❌ Aucun pod quiz-service trouvé."
fi

echo ""
echo "--- 3. Vérification de la configuration Nginx ---"
NGINX_POD=$(kubectl get pods -n $NAMESPACE -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$NGINX_POD" ]; then
  echo "Pod Nginx: $NGINX_POD"
  echo ""
  echo "Configuration pour /api/game:"
  kubectl exec -n $NAMESPACE $NGINX_POD -- cat /etc/nginx/nginx.conf | grep -A 15 "location /api/game" | head -n 20
  echo ""
  echo "Vérification underscores_in_headers:"
  kubectl exec -n $NAMESPACE $NGINX_POD -- cat /etc/nginx/nginx.conf | grep "underscores_in_headers"
else
  echo "❌ Aucun pod Nginx trouvé."
fi

echo ""
echo "--- 4. Vérification des variables d'environnement ---"
if [ -n "$GAME_POD" ]; then
  echo "Game-service QUIZ_SERVICE_URL:"
  kubectl exec -n $NAMESPACE $GAME_POD -- env | grep QUIZ_SERVICE_URL
  echo ""
  echo "Game-service AUTH_SERVICE_URL:"
  kubectl exec -n $NAMESPACE $GAME_POD -- env | grep AUTH_SERVICE_URL
fi

if [ -n "$QUIZ_POD" ]; then
  echo ""
  echo "Quiz-service AUTH_SERVICE_URL:"
  kubectl exec -n $NAMESPACE $QUIZ_POD -- env | grep AUTH_SERVICE_URL
fi

echo ""
echo "--- 5. Test de connectivité entre services ---"
if [ -n "$GAME_POD" ] && [ -n "$QUIZ_POD" ]; then
  echo "Test de connexion game-service → quiz-service:"
  kubectl exec -n $NAMESPACE $GAME_POD -- wget -qO- --timeout=5 http://quiz-service:3002/quiz/test 2>&1 | head -n 5
fi

echo ""
echo "✅ Diagnostic terminé."
echo ""
echo "💡 Actions recommandées:"
echo "   1. Vérifiez que le header Authorization est présent dans les logs du game-service"
echo "   2. Vérifiez que le header est transmis au quiz-service"
echo "   3. Vérifiez que la configuration Nginx est correcte"
echo "   4. Si le header est Missing, redémarrez Nginx: kubectl rollout restart deployment/$NGINX_DEPLOYMENT -n $NAMESPACE"

