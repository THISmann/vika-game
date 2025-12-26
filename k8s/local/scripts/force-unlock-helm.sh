#!/bin/bash

# Script pour forcer le déblocage d'une release Helm spécifique

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <release-name> <namespace>"
  echo ""
  echo "Exemples:"
  echo "  $0 nginx-ingress nginx-ingress"
  echo "  $0 app intelectgame"
  exit 1
fi

RELEASE_NAME=$1
NAMESPACE=$2

echo "🔓 Déblocage forcé de la release Helm: $RELEASE_NAME dans $NAMESPACE"
echo ""

# 1. Vérifier l'état actuel
echo "📋 État actuel de la release:"
helm status $RELEASE_NAME -n $NAMESPACE 2>&1 || echo "Release non trouvée ou en erreur"
echo ""

# 2. Supprimer les secrets de release bloqués
echo "🔍 Recherche des secrets de release..."
RELEASE_SECRETS=$(kubectl get secrets -n $NAMESPACE -l owner=helm 2>/dev/null | grep "sh.helm.release.v1.$RELEASE_NAME" | awk '{print $1}' || echo "")

if [ -n "$RELEASE_SECRETS" ]; then
  echo "   Secrets trouvés:"
  echo "$RELEASE_SECRETS" | while read secret; do
    STATUS=$(kubectl get secret $secret -n $NAMESPACE -o jsonpath='{.metadata.labels.status}' 2>/dev/null || echo "unknown")
    echo "   - $secret (status: $STATUS)"
    
    if [ "$STATUS" = "pending-install" ] || [ "$STATUS" = "pending-upgrade" ] || [ "$STATUS" = "pending-rollback" ]; then
      echo "     🗑️  Suppression du secret bloqué..."
      kubectl delete secret $secret -n $NAMESPACE
      echo "     ✅ Secret supprimé"
    fi
  done
else
  echo "   ✅ Aucun secret de release trouvé"
fi

echo ""

# 3. Essayer de supprimer la release si elle existe
echo "🗑️  Tentative de suppression de la release..."
helm delete $RELEASE_NAME -n $NAMESPACE --ignore-not-found 2>&1 || true

echo ""
echo "✅ Déblocage terminé. Vous pouvez maintenant redéployer:"
echo "   helm upgrade --install $RELEASE_NAME <chart-path> -n $NAMESPACE"


