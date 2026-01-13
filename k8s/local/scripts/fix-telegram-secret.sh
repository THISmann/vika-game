#!/bin/bash

# Script pour supprimer le secret telegram-bot-secret existant
# afin qu'il puisse être créé par Helm avec les bons labels/annotations

set -e

NAMESPACE="intelectgame"
SECRET_NAME="telegram-bot-secret"

echo "🔧 Correction du secret telegram-bot-secret pour Helm..."
echo ""

# Vérifier si le secret existe
if kubectl get secret $SECRET_NAME -n $NAMESPACE &> /dev/null; then
  echo "📋 Secret $SECRET_NAME trouvé dans le namespace $NAMESPACE"
  
  # Sauvegarder le token actuel si présent
  CURRENT_TOKEN=$(kubectl get secret $SECRET_NAME -n $NAMESPACE -o jsonpath='{.data.TELEGRAM_BOT_TOKEN}' 2>/dev/null | base64 -d 2>/dev/null || echo "")
  
  if [ -n "$CURRENT_TOKEN" ] && [ "$CURRENT_TOKEN" != "YOUR_TELEGRAM_BOT_TOKEN_HERE" ] && [ "$CURRENT_TOKEN" != "PLACEHOLDER_REPLACE_WITH_ACTUAL_TOKEN" ]; then
    echo "💾 Token actuel trouvé (longueur: ${#CURRENT_TOKEN})"
    echo "⚠️  Le secret sera supprimé et recréé par Helm"
    echo "⚠️  Assurez-vous que le token est configuré dans values.yaml ou recréez-le après le déploiement"
    read -p "Continuer? (y/n): " CONFIRM
    if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
      echo "❌ Opération annulée"
      exit 0
    fi
  fi
  
  # Supprimer le secret
  echo ""
  echo "🗑️  Suppression du secret $SECRET_NAME..."
  kubectl delete secret $SECRET_NAME -n $NAMESPACE
  
  echo "✅ Secret supprimé. Helm pourra maintenant le créer avec les bons labels/annotations."
  echo ""
  echo "💡 Après le déploiement Helm, si vous devez mettre à jour le token:"
  echo "   kubectl create secret generic $SECRET_NAME \\"
  echo "     --from-literal=TELEGRAM_BOT_TOKEN=<VOTRE_TOKEN> \\"
  echo "     -n $NAMESPACE \\"
  echo "     --dry-run=client -o yaml | kubectl apply -f -"
  echo ""
  echo "   Ou utilisez: kubectl edit secret $SECRET_NAME -n $NAMESPACE"
else
  echo "✅ Secret $SECRET_NAME n'existe pas. Helm pourra le créer sans problème."
fi


