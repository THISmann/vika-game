#!/bin/bash

# Script pour mettre à jour le token Telegram (version non-interactive)
# Usage: ./update-telegram-token-non-interactive.sh YOUR_TOKEN_HERE

NAMESPACE="intelectgame"
SECRET_NAME="telegram-bot-secret"

if [ -z "$1" ]; then
  echo "❌ Usage: $0 <TELEGRAM_BOT_TOKEN>"
  echo "   Exemple: $0 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
  exit 1
fi

NEW_TOKEN="$1"

# Vérifier le format du token
if [[ ! "$NEW_TOKEN" =~ : ]]; then
  echo "❌ Format de token invalide. Le token doit contenir ':' (ex: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)"
  exit 1
fi

echo "🔐 Mise à jour du token Telegram (non-interactive)"
echo "Token preview: ${NEW_TOKEN:0:20}... (longueur: ${#NEW_TOKEN})"
echo ""

# Mettre à jour le Secret
kubectl create secret generic $SECRET_NAME \
  --from-literal=TELEGRAM_BOT_TOKEN="$NEW_TOKEN" \
  --dry-run=client -o yaml | kubectl apply -f - -n $NAMESPACE

if [ $? -eq 0 ]; then
  echo "✅ Secret mis à jour avec succès"
else
  echo "❌ Erreur lors de la mise à jour du Secret"
  exit 1
fi

# Redémarrer le pod
echo ""
echo "🔄 Redémarrage du pod telegram-bot..."
kubectl rollout restart deployment/telegram-bot -n $NAMESPACE
kubectl rollout status deployment/telegram-bot -n $NAMESPACE --timeout=60s

echo ""
echo "✅ Mise à jour terminée."
echo ""
echo "💡 Vérifiez les logs: kubectl logs -n $NAMESPACE -l app=telegram-bot --tail=20"

