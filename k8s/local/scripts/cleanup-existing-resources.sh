#!/bin/bash

# Script pour nettoyer les ressources existantes qui ne sont pas gérées par Helm
# Cela permet à Helm de les créer avec les bons labels/annotations

set -e

NAMESPACE="intelectgame"

echo "🧹 Nettoyage des ressources existantes non gérées par Helm..."
echo ""

# Liste des ressources à vérifier
RESOURCES=(
  "secret:telegram-bot-secret"
  "configmap:app-config"
)

CLEANED=0

for resource in "${RESOURCES[@]}"; do
  IFS=':' read -r kind name <<< "$resource"
  
  if kubectl get $kind $name -n $NAMESPACE &> /dev/null; then
    echo "📋 $kind/$name trouvé dans le namespace $NAMESPACE"
    
    # Vérifier si géré par Helm
    MANAGED_BY=$(kubectl get $kind $name -n $NAMESPACE -o jsonpath='{.metadata.labels.app\.kubernetes\.io/managed-by}' 2>/dev/null || echo "")
    
    if [ "$MANAGED_BY" != "Helm" ]; then
      echo "⚠️  $kind/$name n'est pas géré par Helm (managed-by: ${MANAGED_BY:-none})"
      
      # Sauvegarder les données importantes si nécessaire
      if [ "$kind" == "secret" ] && [ "$name" == "telegram-bot-secret" ]; then
        CURRENT_TOKEN=$(kubectl get secret $name -n $NAMESPACE -o jsonpath='{.data.TELEGRAM_BOT_TOKEN}' 2>/dev/null | base64 -d 2>/dev/null || echo "")
        if [ -n "$CURRENT_TOKEN" ] && [ "$CURRENT_TOKEN" != "YOUR_TELEGRAM_BOT_TOKEN_HERE" ] && [ "$CURRENT_TOKEN" != "PLACEHOLDER_REPLACE_WITH_ACTUAL_TOKEN" ]; then
          echo "💾 Token actuel trouvé (longueur: ${#CURRENT_TOKEN})"
          echo "⚠️  Le secret sera supprimé. Vous devrez le recréer après le déploiement Helm."
        fi
      fi
      
      read -p "   Supprimer $kind/$name? (y/n): " CONFIRM
      if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
        kubectl delete $kind $name -n $NAMESPACE
        echo "   ✅ $kind/$name supprimé"
        CLEANED=$((CLEANED + 1))
      else
        echo "   ⏭️  $kind/$name conservé"
      fi
    else
      echo "✅ $kind/$name est déjà géré par Helm"
    fi
    echo ""
  else
    echo "✅ $kind/$name n'existe pas (sera créé par Helm)"
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $CLEANED -gt 0 ]; then
  echo "✅ $CLEANED ressource(s) nettoyée(s)"
  echo ""
  echo "💡 Vous pouvez maintenant redéployer avec Helm:"
  echo "   ./k8s/local/scripts/deploy-local.sh"
else
  echo "✅ Aucune ressource à nettoyer"
fi


