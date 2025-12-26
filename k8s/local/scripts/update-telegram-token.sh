#!/bin/bash

# Script pour mettre à jour le token Telegram Bot dans Kubernetes

set -e

NAMESPACE="intelectgame"
SECRET_NAME="telegram-bot-secret"

echo "🤖 Mise à jour du token Telegram Bot..."
echo ""

# Vérifier que le secret existe
if ! kubectl get secret $SECRET_NAME -n $NAMESPACE &> /dev/null; then
  echo "❌ Secret $SECRET_NAME n'existe pas dans le namespace $NAMESPACE"
  echo "💡 Création du secret..."
  read -p "Entrez votre token Telegram Bot: " TOKEN
  kubectl create secret generic $SECRET_NAME \
    --from-literal=TELEGRAM_BOT_TOKEN="$TOKEN" \
    -n $NAMESPACE
  echo "✅ Secret créé"
else
  # Afficher le token actuel (masqué)
  CURRENT_TOKEN=$(kubectl get secret $SECRET_NAME -n $NAMESPACE -o jsonpath='{.data.TELEGRAM_BOT_TOKEN}' 2>/dev/null | base64 -d || echo "")
  if [ -n "$CURRENT_TOKEN" ]; then
    TOKEN_PREVIEW="${CURRENT_TOKEN:0:10}...${CURRENT_TOKEN: -5}"
    echo "📋 Token actuel: $TOKEN_PREVIEW"
  fi
  
  echo ""
  read -p "Entrez le nouveau token Telegram Bot: " NEW_TOKEN
  
  if [ -z "$NEW_TOKEN" ]; then
    echo "❌ Token vide. Opération annulée."
    exit 1
  fi
  
  # Mettre à jour le secret
  echo ""
  echo "🔄 Mise à jour du secret..."
  kubectl create secret generic $SECRET_NAME \
    --from-literal=TELEGRAM_BOT_TOKEN="$NEW_TOKEN" \
    -n $NAMESPACE \
    --dry-run=client -o yaml | kubectl apply -f -
  
  echo "✅ Secret mis à jour"
fi

# Redémarrer le deployment telegram-bot
echo ""
echo "🔄 Redémarrage du deployment telegram-bot..."
kubectl rollout restart deployment/telegram-bot -n $NAMESPACE

echo ""
echo "⏳ Attente que le pod redémarre..."
kubectl rollout status deployment/telegram-bot -n $NAMESPACE --timeout=60s

echo ""
echo "✅ Token mis à jour et pod redémarré!"
echo ""
echo "💡 Vérifier les logs:"
echo "   kubectl logs -f -n $NAMESPACE -l app=telegram-bot"


