#!/bin/bash
# Script pour vérifier le token Telegram Bot
# Usage: ./k8s/verify-telegram-token.sh [TOKEN]

set -e

TOKEN=${1:-${TELEGRAM_BOT_TOKEN}}

if [ -z "$TOKEN" ]; then
  echo "❌ Erreur: Token requis"
  echo "Usage: ./k8s/verify-telegram-token.sh <TOKEN>"
  echo "   ou: TELEGRAM_BOT_TOKEN=<TOKEN> ./k8s/verify-telegram-token.sh"
  exit 1
fi

echo "🔍 Vérification du token Telegram Bot..."

# Vérifier le format du token (doit contenir ':')
if [[ ! "$TOKEN" =~ ^[0-9]+:[A-Za-z0-9_-]+$ ]]; then
  echo "❌ Format de token invalide!"
  echo "   Le token doit être au format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
  exit 1
fi

# Extraire l'ID du bot
BOT_ID=$(echo "$TOKEN" | cut -d':' -f1)
echo "✅ Format du token valide (Bot ID: $BOT_ID)"

# Tester le token avec l'API Telegram
echo "📡 Test de connexion à l'API Telegram..."
RESPONSE=$(curl -s "https://api.telegram.org/bot${TOKEN}/getMe")

if echo "$RESPONSE" | grep -q '"ok":true'; then
  BOT_USERNAME=$(echo "$RESPONSE" | grep -o '"username":"[^"]*' | cut -d'"' -f4)
  BOT_NAME=$(echo "$RESPONSE" | grep -o '"first_name":"[^"]*' | cut -d'"' -f4)
  echo "✅ Token valide!"
  echo "   Bot: @${BOT_USERNAME} (${BOT_NAME})"
  echo "   ID: ${BOT_ID}"
else
  echo "❌ Token invalide ou bot supprimé!"
  echo "   Réponse API: $RESPONSE"
  exit 1
fi

echo ""
echo "✅ Le token est valide et fonctionne correctement!"

