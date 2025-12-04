#!/bin/bash
# Script pour mettre à jour le secret Telegram Bot depuis GitHub Secrets
# Usage: ./k8s/update-telegram-secret.sh <TELEGRAM_BOT_TOKEN>

set -e

TELEGRAM_BOT_TOKEN=${1:-${TELEGRAM_BOT_TOKEN}}

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
  echo "❌ Erreur: TELEGRAM_BOT_TOKEN est requis"
  echo "Usage: ./k8s/update-telegram-secret.sh <TOKEN>"
  echo "   ou: TELEGRAM_BOT_TOKEN=<TOKEN> ./k8s/update-telegram-secret.sh"
  exit 1
fi

echo "🔐 Mise à jour du secret Telegram Bot..."

# Créer ou mettre à jour le secret
kubectl create secret generic telegram-bot-secret \
  --from-literal=TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN" \
  --namespace=intelectgame \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ Secret mis à jour avec succès !"
echo "🔄 Redémarrage du pod telegram-bot..."
kubectl rollout restart deployment/telegram-bot -n intelectgame

echo "⏳ Attente du redémarrage..."
kubectl rollout status deployment/telegram-bot -n intelectgame --timeout=120s

echo "✅ Bot Telegram redémarré et prêt !"

