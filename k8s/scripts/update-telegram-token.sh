#!/bin/bash

# Script pour mettre à jour le token Telegram dans le Secret Kubernetes

NAMESPACE="intelectgame"
SECRET_NAME="telegram-bot-secret"

echo "🔐 Mise à jour du token Telegram"
echo ""

# 1. Vérifier si le Secret existe
echo "--- 1. Vérification du Secret ---"
if kubectl get secret $SECRET_NAME -n $NAMESPACE >/dev/null 2>&1; then
  echo "✅ Secret $SECRET_NAME existe"
  CURRENT_TOKEN=$(kubectl get secret $SECRET_NAME -n $NAMESPACE -o jsonpath='{.data.TELEGRAM_BOT_TOKEN}' | base64 -d 2>/dev/null)
  if [ -n "$CURRENT_TOKEN" ]; then
    echo "Token actuel (preview): ${CURRENT_TOKEN:0:20}... (longueur: ${#CURRENT_TOKEN})"
  else
    echo "⚠️ Token actuel: vide ou invalide"
  fi
else
  echo "❌ Secret $SECRET_NAME n'existe pas"
  echo "Création du Secret..."
fi
echo ""

# 2. Demander le nouveau token
echo "--- 2. Saisie du nouveau token ---"
echo "Format attendu: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
echo ""
read -p "Entrez votre token Telegram: " NEW_TOKEN

if [ -z "$NEW_TOKEN" ]; then
  echo "❌ Token vide. Abandon."
  exit 1
fi

# Vérifier le format du token (doit contenir un ':')
if [[ ! "$NEW_TOKEN" =~ : ]]; then
  echo "❌ Format de token invalide. Le token doit contenir ':' (ex: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)"
  exit 1
fi

echo ""
echo "Token reçu (longueur: ${#NEW_TOKEN})"
echo "Preview: ${NEW_TOKEN:0:20}..."
echo ""

# 3. Confirmer
read -p "Confirmer la mise à jour? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "❌ Mise à jour annulée."
  exit 0
fi

echo ""

# 4. Mettre à jour ou créer le Secret
echo "--- 3. Mise à jour du Secret ---"
kubectl create secret generic $SECRET_NAME \
  --from-literal=TELEGRAM_BOT_TOKEN="$NEW_TOKEN" \
  --dry-run=client -o yaml | kubectl apply -f - -n $NAMESPACE

if [ $? -eq 0 ]; then
  echo "✅ Secret mis à jour avec succès"
else
  echo "❌ Erreur lors de la mise à jour du Secret"
  exit 1
fi

echo ""

# 5. Vérifier la mise à jour
echo "--- 4. Vérification ---"
UPDATED_TOKEN=$(kubectl get secret $SECRET_NAME -n $NAMESPACE -o jsonpath='{.data.TELEGRAM_BOT_TOKEN}' | base64 -d 2>/dev/null)
if [ "$UPDATED_TOKEN" = "$NEW_TOKEN" ]; then
  echo "✅ Token correctement mis à jour"
  echo "Preview: ${UPDATED_TOKEN:0:20}..."
else
  echo "⚠️ Le token ne correspond pas. Vérifiez manuellement."
fi

echo ""

# 6. Redémarrer le pod pour qu'il prenne le nouveau token
echo "--- 5. Redémarrage du pod telegram-bot ---"
kubectl rollout restart deployment/telegram-bot -n $NAMESPACE
echo ""

echo "⏳ Attente que le pod redémarre (max 60s)..."
kubectl rollout status deployment/telegram-bot -n $NAMESPACE --timeout=60s

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Pod redémarré avec succès"
  echo ""
  echo "--- 6. Vérification des logs ---"
  sleep 5
  TELEGRAM_POD=$(kubectl get pods -n $NAMESPACE -l app=telegram-bot -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  if [ -n "$TELEGRAM_POD" ]; then
    echo "Derniers logs:"
    kubectl logs $TELEGRAM_POD -n $NAMESPACE --tail=20
  fi
else
  echo "⚠️ Le redémarrage a pris plus de temps que prévu. Vérifiez manuellement:"
  echo "   kubectl get pods -n $NAMESPACE -l app=telegram-bot"
  echo "   kubectl logs -n $NAMESPACE -l app=telegram-bot --tail=50"
fi

echo ""
echo "✅ Mise à jour terminée."

