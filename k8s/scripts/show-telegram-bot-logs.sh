#!/bin/bash

# Script pour afficher les logs du pod telegram-bot

NAMESPACE="intelectgame"
TELEGRAM_BOT_LABEL="telegram-bot"

echo "🤖 Logs du bot Telegram"
echo ""

# 1. Vérifier que les pods existent
echo "--- 1. État des pods telegram-bot ---"
kubectl get pods -n $NAMESPACE -l app=$TELEGRAM_BOT_LABEL
echo ""

# 2. Récupérer le nom du pod
TELEGRAM_POD=$(kubectl get pods -n $NAMESPACE -l app=$TELEGRAM_BOT_LABEL -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [ -z "$TELEGRAM_POD" ]; then
  echo "❌ Aucun pod telegram-bot trouvé dans le namespace '$NAMESPACE'."
  echo ""
  echo "💡 Vérifiez que le bot Telegram est déployé:"
  echo "   kubectl get deployments -n $NAMESPACE | grep telegram"
  exit 1
fi

echo "📋 Pod trouvé: $TELEGRAM_POD"
echo ""

# 3. Afficher les logs récents (100 dernières lignes)
echo "--- 2. Derniers logs (100 lignes) ---"
kubectl logs $TELEGRAM_POD -n $NAMESPACE --tail=100
echo ""

# 4. Afficher les logs en temps réel (optionnel)
echo "--- 3. Logs en temps réel (Ctrl+C pour arrêter) ---"
echo "Appuyez sur Ctrl+C pour arrêter le suivi des logs"
echo ""
kubectl logs -f $TELEGRAM_POD -n $NAMESPACE

