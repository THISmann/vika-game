#!/bin/bash

# Script de diagnostic complet pour le bot Telegram

NAMESPACE="intelectgame"
TELEGRAM_BOT_LABEL="telegram-bot"

echo "🔍 Diagnostic du bot Telegram"
echo ""

# 1. Vérifier l'état du deployment
echo "--- 1. État du deployment ---"
kubectl get deployment telegram-bot -n $NAMESPACE 2>/dev/null || echo "❌ Deployment telegram-bot non trouvé"
echo ""

# 2. Vérifier l'état des pods
echo "--- 2. État des pods ---"
kubectl get pods -n $NAMESPACE -l app=$TELEGRAM_BOT_LABEL
echo ""

# 3. Décrire le pod pour voir les événements
TELEGRAM_POD=$(kubectl get pods -n $NAMESPACE -l app=$TELEGRAM_BOT_LABEL -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [ -z "$TELEGRAM_POD" ]; then
  echo "❌ Aucun pod telegram-bot trouvé."
  echo ""
  echo "💡 Vérifiez que le bot Telegram est déployé:"
  echo "   kubectl get deployments -n $NAMESPACE"
  exit 1
fi

echo "--- 3. Description du pod: $TELEGRAM_POD ---"
kubectl describe pod $TELEGRAM_POD -n $NAMESPACE | tail -n 50
echo ""

# 4. Vérifier les variables d'environnement
echo "--- 4. Variables d'environnement ---"
kubectl exec -n $NAMESPACE $TELEGRAM_POD -- env 2>/dev/null | grep -E "(TELEGRAM|AUTH|QUIZ|GAME|MONGODB|REDIS)" || echo "⚠️ Impossible de récupérer les variables d'environnement"
echo ""

# 5. Afficher les logs récents
echo "--- 5. Derniers logs (50 lignes) ---"
kubectl logs $TELEGRAM_POD -n $NAMESPACE --tail=50
echo ""

# 6. Vérifier les erreurs dans les logs
echo "--- 6. Recherche d'erreurs dans les logs ---"
kubectl logs $TELEGRAM_POD -n $NAMESPACE --tail=200 | grep -i -E "(error|exception|failed|crash|undefined|cannot|missing)" | tail -n 20 || echo "✅ Aucune erreur trouvée dans les derniers logs"
echo ""

# 7. Vérifier la connectivité aux services
echo "--- 7. Test de connectivité aux services ---"
echo "Test auth-service:"
kubectl exec -n $NAMESPACE $TELEGRAM_POD -- wget -qO- --timeout=5 http://auth-service:3001/auth/test 2>&1 | head -n 3 || echo "❌ Impossible de se connecter à auth-service"
echo ""

echo "Test quiz-service:"
kubectl exec -n $NAMESPACE $TELEGRAM_POD -- wget -qO- --timeout=5 http://quiz-service:3002/quiz/test 2>&1 | head -n 3 || echo "❌ Impossible de se connecter à quiz-service"
echo ""

echo "Test game-service:"
kubectl exec -n $NAMESPACE $TELEGRAM_POD -- wget -qO- --timeout=5 http://game-service:3003/game/test 2>&1 | head -n 3 || echo "❌ Impossible de se connecter à game-service"
echo ""

# 8. Vérifier le ConfigMap et les secrets
echo "--- 8. Configuration ---"
echo "Variables d'environnement du deployment:"
kubectl get deployment telegram-bot -n $NAMESPACE -o yaml 2>/dev/null | grep -A 2 "env:" | head -n 20 || echo "⚠️ Impossible de récupérer la configuration"
echo ""

echo "✅ Diagnostic terminé."
echo ""
echo "💡 Commandes utiles:"
echo "   - Voir tous les logs: kubectl logs -f $TELEGRAM_POD -n $NAMESPACE"
echo "   - Redémarrer le pod: kubectl delete pod $TELEGRAM_POD -n $NAMESPACE"
echo "   - Redémarrer le deployment: kubectl rollout restart deployment/telegram-bot -n $NAMESPACE"

