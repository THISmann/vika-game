#!/bin/bash
# Script pour tester le token Telegram depuis le pod
# Usage: ./k8s/test-telegram-token-in-pod.sh

set -e

echo "🔍 Test du token Telegram depuis le pod..."

# Obtenir le nom du pod
POD_NAME=$(kubectl get pods -n intelectgame -l app=telegram-bot -o jsonpath='{.items[0].metadata.name}')

if [ -z "$POD_NAME" ]; then
  echo "❌ Aucun pod telegram-bot trouvé"
  exit 1
fi

echo "📦 Pod: $POD_NAME"

# Vérifier la variable d'environnement dans le pod
echo ""
echo "🔐 Variable d'environnement TELEGRAM_BOT_TOKEN dans le pod:"
TOKEN_IN_POD=$(kubectl exec -n intelectgame $POD_NAME -- printenv TELEGRAM_BOT_TOKEN)

if [ -z "$TOKEN_IN_POD" ]; then
  echo "❌ TELEGRAM_BOT_TOKEN n'est pas défini dans le pod!"
  exit 1
fi

# Afficher seulement le préfixe pour sécurité
TOKEN_PREFIX=$(echo "$TOKEN_IN_POD" | cut -d':' -f1)
echo "   Token ID: ${TOKEN_PREFIX}..."

# Vérifier le format
if [[ ! "$TOKEN_IN_POD" =~ ^[0-9]+:[A-Za-z0-9_-]+$ ]]; then
  echo "❌ Format de token invalide dans le pod!"
  echo "   Format attendu: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
  exit 1
fi

echo "✅ Format du token valide"

# Tester le token avec l'API Telegram depuis le pod
echo ""
echo "📡 Test de connexion à l'API Telegram depuis le pod..."
RESPONSE=$(kubectl exec -n intelectgame $POD_NAME -- sh -c "curl -s 'https://api.telegram.org/bot${TOKEN_IN_POD}/getMe'")

if echo "$RESPONSE" | grep -q '"ok":true'; then
  BOT_USERNAME=$(echo "$RESPONSE" | grep -o '"username":"[^"]*' | cut -d'"' -f4)
  BOT_NAME=$(echo "$RESPONSE" | grep -o '"first_name":"[^"]*' | cut -d'"' -f4)
  echo "✅ Token valide!"
  echo "   Bot: @${BOT_USERNAME} (${BOT_NAME})"
  echo "   ID: ${TOKEN_PREFIX}"
else
  echo "❌ Token invalide ou bot supprimé!"
  echo "   Réponse API: $RESPONSE"
  exit 1
fi

echo ""
echo "✅ Le token est valide et fonctionne correctement dans le pod!"

