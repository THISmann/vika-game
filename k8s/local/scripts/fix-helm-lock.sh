#!/bin/bash

# Script pour diagnostiquer et résoudre les problèmes de verrouillage Helm

set -e

echo "🔍 Diagnostic des verrouillages Helm..."
echo ""

# Vérifier les releases en cours
echo "📋 Releases Helm dans tous les namespaces:"
helm list --all-namespaces

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier les secrets de release (qui contiennent l'état)
NAMESPACES=("database" "monitoring" "nginx-ingress" "elk" "intelectgame")

for ns in "${NAMESPACES[@]}"; do
  echo "🔍 Vérification du namespace: $ns"
  
  # Vérifier les secrets de release Helm
  RELEASE_SECRETS=$(kubectl get secrets -n $ns -l owner=helm 2>/dev/null | grep -v "^NAME" | awk '{print $1}' || echo "")
  
  if [ -n "$RELEASE_SECRETS" ]; then
    echo "   Secrets de release trouvés:"
    echo "$RELEASE_SECRETS" | while read secret; do
      STATUS=$(kubectl get secret $secret -n $ns -o jsonpath='{.metadata.labels.status}' 2>/dev/null || echo "unknown")
      echo "   - $secret (status: $STATUS)"
      
      # Vérifier si le status est "pending-install" ou "pending-upgrade"
      if [ "$STATUS" = "pending-install" ] || [ "$STATUS" = "pending-upgrade" ]; then
        echo "     ⚠️  Release bloquée en état: $STATUS"
        read -p "     Supprimer ce secret pour débloquer? (y/n): " CONFIRM
        if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
          echo "     🗑️  Suppression de $secret..."
          kubectl delete secret $secret -n $ns
          echo "     ✅ Secret supprimé"
        fi
      fi
    done
  else
    echo "   ✅ Aucun secret de release trouvé"
  fi
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Si des releases sont toujours bloquées, vous pouvez:"
echo "   1. Supprimer manuellement les secrets de release:"
echo "      kubectl get secrets -n <namespace> -l owner=helm"
echo "      kubectl delete secret <secret-name> -n <namespace>"
echo ""
echo "   2. Ou forcer la suppression d'une release:"
echo "      helm delete <release-name> -n <namespace> --ignore-not-found"
echo ""


