#!/bin/bash

# Script pour forcer la suppression de toutes les ressources problématiques

set -e

NAMESPACE="intelectgame"

echo "🧹 Nettoyage forcé des ressources dans $NAMESPACE..."
echo ""

# Liste des ressources à supprimer
RESOURCES=(
  "configmap:app-config"
  "secret:telegram-bot-secret"
  "service:auth-service"
  "service:quiz-service"
  "service:game-service"
  "service:frontend"
  "service:telegram-bot"
  "deployment:auth-service"
  "deployment:quiz-service"
  "deployment:game-service"
  "deployment:frontend"
  "deployment:telegram-bot"
)

for resource in "${RESOURCES[@]}"; do
  IFS=':' read -r kind name <<< "$resource"
  if kubectl get $kind $name -n $NAMESPACE &> /dev/null; then
    echo "🗑️  Suppression de $kind/$name..."
    kubectl delete $kind $name -n $NAMESPACE
    echo "✅ $kind/$name supprimé"
  else
    echo "✅ $kind/$name n'existe pas"
  fi
done

echo ""
echo "✅ Nettoyage terminé. Vous pouvez maintenant redéployer:"
echo "   ./k8s/local/scripts/deploy-local.sh"

