#!/bin/bash

# Script pour diagnostiquer les problèmes de pods

NAMESPACE="intelectgame"

echo "🔍 Diagnostic des pods dans $NAMESPACE..."
echo ""

# Lister tous les pods avec leur statut
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 État des pods:"
kubectl get pods -n $NAMESPACE -o wide
echo ""

# Pour chaque pod, afficher les détails
PODS=$(kubectl get pods -n $NAMESPACE -o name)

for pod in $PODS; do
  POD_NAME=$(echo $pod | cut -d'/' -f2)
  STATUS=$(kubectl get pod $POD_NAME -n $NAMESPACE -o jsonpath='{.status.phase}')
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔍 Pod: $POD_NAME (Status: $STATUS)"
  
  if [ "$STATUS" != "Running" ]; then
    echo ""
    echo "📋 Détails:"
    kubectl describe pod $POD_NAME -n $NAMESPACE | grep -A 10 "Events:" || true
    echo ""
    echo "📝 Conditions:"
    kubectl get pod $POD_NAME -n $NAMESPACE -o jsonpath='{.status.conditions[*].type}{"\t"}{.status.conditions[*].status}{"\n"}' | tr ' ' '\n' | paste - -
    echo ""
    
    # Vérifier les erreurs d'image
    IMAGE_PULL_ERROR=$(kubectl describe pod $POD_NAME -n $NAMESPACE | grep -i "image" | grep -i "error\|fail\|pull" || echo "")
    if [ -n "$IMAGE_PULL_ERROR" ]; then
      echo "⚠️  Erreur d'image détectée:"
      echo "$IMAGE_PULL_ERROR"
      echo ""
    fi
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 Commandes utiles:"
echo "   - Voir les logs d'un pod: kubectl logs <pod-name> -n $NAMESPACE"
echo "   - Décrire un pod: kubectl describe pod <pod-name> -n $NAMESPACE"
echo "   - Voir les événements: kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp'"


