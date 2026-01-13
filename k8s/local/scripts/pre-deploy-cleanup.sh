#!/bin/bash

# Script pour nettoyer les ressources existantes avant le déploiement Helm
# Cela évite les conflits de propriété

set -e

NAMESPACE="intelectgame"

echo "🧹 Nettoyage pré-déploiement des ressources existantes..."
echo ""

# Fonction pour vérifier et supprimer une ressource
check_and_delete() {
  local kind=$1
  local name=$2
  
  if kubectl get $kind $name -n $NAMESPACE &> /dev/null; then
    MANAGED_BY=$(kubectl get $kind $name -n $NAMESPACE -o jsonpath='{.metadata.labels.app\.kubernetes\.io/managed-by}' 2>/dev/null || echo "")
    
    if [ "$MANAGED_BY" != "Helm" ]; then
      echo "🗑️  Suppression de $kind/$name (non géré par Helm)..."
      kubectl delete $kind $name -n $NAMESPACE 2>/dev/null || true
      return 0
    else
      echo "✅ $kind/$name est déjà géré par Helm"
      return 1
    fi
  else
    echo "✅ $kind/$name n'existe pas"
    return 1
  fi
}

DELETED=0

# Liste des ressources à vérifier
echo "Vérification des ressources..."
echo ""

check_and_delete "configmap" "app-config" && DELETED=$((DELETED + 1))
check_and_delete "secret" "telegram-bot-secret" && DELETED=$((DELETED + 1))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $DELETED -gt 0 ]; then
  echo "✅ $DELETED ressource(s) supprimée(s)"
else
  echo "✅ Aucune ressource à supprimer"
fi
echo ""
echo "💡 Vous pouvez maintenant déployer avec Helm:"
echo "   ./k8s/local/scripts/deploy-local.sh"


