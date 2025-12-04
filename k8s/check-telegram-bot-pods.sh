#!/bin/bash
# Script pour vérifier et corriger les pods telegram-bot multiples

set -e

echo "🔍 Vérification des pods telegram-bot..."
echo ""

# Vérifier tous les pods telegram-bot
PODS=$(kubectl get pods -n intelectgame -l app=telegram-bot -o jsonpath='{.items[*].metadata.name}' 2>/dev/null || echo "")

if [ -z "$PODS" ]; then
  echo "❌ Aucun pod telegram-bot trouvé"
  exit 1
fi

echo "📦 Pods trouvés:"
POD_COUNT=0
echo "$PODS" | tr ' ' '\n' | while read pod; do
  if [ -n "$pod" ]; then
    STATUS=$(kubectl get pod $pod -n intelectgame -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
    READY=$(kubectl get pod $pod -n intelectgame -o jsonpath='{.status.containerStatuses[0].ready}' 2>/dev/null || echo "false")
    AGE=$(kubectl get pod $pod -n intelectgame -o jsonpath='{.metadata.creationTimestamp}' 2>/dev/null || echo "Unknown")
    echo "   - $pod"
    echo "     Status: $STATUS"
    echo "     Ready: $READY"
    echo "     Created: $AGE"
    echo ""
  fi
done

# Compter les pods
POD_COUNT=$(echo "$PODS" | tr ' ' '\n' | grep -v '^$' | wc -l | tr -d ' ')

echo "📊 Nombre total de pods: $POD_COUNT"
echo ""

# Vérifier le nombre de replicas configuré
REPLICAS=$(kubectl get deployment telegram-bot -n intelectgame -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")
echo "📊 Nombre de replicas configuré: $REPLICAS"
echo ""

if [ "$REPLICAS" != "1" ]; then
  echo "⚠️  Le nombre de replicas n'est pas 1. Correction..."
  kubectl scale deployment telegram-bot --replicas=1 -n intelectgame
  echo "✅ Nombre de replicas mis à 1"
  echo ""
  echo "⏳ Attente de la stabilisation (10 secondes)..."
  sleep 10
fi

# Vérifier à nouveau après correction
echo ""
echo "🔄 Vérification après correction..."
NEW_PODS=$(kubectl get pods -n intelectgame -l app=telegram-bot -o jsonpath='{.items[*].metadata.name}' 2>/dev/null || echo "")
NEW_COUNT=$(echo "$NEW_PODS" | tr ' ' '\n' | grep -v '^$' | wc -l | tr -d ' ')

echo "📊 Nouveau nombre de pods: $NEW_COUNT"
echo ""

if [ "$NEW_COUNT" -gt 1 ]; then
  echo "⚠️  Encore plusieurs pods détectés. Suppression des anciens..."
  
  # Garder seulement le pod le plus récent (Running)
  RUNNING_PODS=$(kubectl get pods -n intelectgame -l app=telegram-bot --field-selector=status.phase=Running -o jsonpath='{.items[*].metadata.name}' 2>/dev/null || echo "")
  
  if [ -n "$RUNNING_PODS" ]; then
    LATEST_POD=$(echo "$RUNNING_PODS" | tr ' ' '\n' | head -1)
    echo "✅ Pod à conserver: $LATEST_POD"
    
    echo "$NEW_PODS" | tr ' ' '\n' | while read pod; do
      if [ -n "$pod" ] && [ "$pod" != "$LATEST_POD" ]; then
        echo "   🗑️  Suppression de $pod..."
        kubectl delete pod $pod -n intelectgame --grace-period=0 --force 2>/dev/null || true
      fi
    done
  else
    echo "⚠️  Aucun pod Running trouvé. Suppression de tous les pods sauf le plus récent..."
    LATEST_POD=$(kubectl get pods -n intelectgame -l app=telegram-bot --sort-by=.metadata.creationTimestamp -o jsonpath='{.items[-1].metadata.name}' 2>/dev/null || echo "")
    
    if [ -n "$LATEST_POD" ]; then
      echo "$NEW_PODS" | tr ' ' '\n' | while read pod; do
        if [ -n "$pod" ] && [ "$pod" != "$LATEST_POD" ]; then
          echo "   🗑️  Suppression de $pod..."
          kubectl delete pod $pod -n intelectgame --grace-period=0 --force 2>/dev/null || true
        fi
      done
    fi
  fi
  
  echo ""
  echo "⏳ Attente de la stabilisation (15 secondes)..."
  sleep 15
fi

# Vérification finale
echo ""
echo "✅ Vérification finale..."
FINAL_PODS=$(kubectl get pods -n intelectgame -l app=telegram-bot -o jsonpath='{.items[*].metadata.name}' 2>/dev/null || echo "")
FINAL_COUNT=$(echo "$FINAL_PODS" | tr ' ' '\n' | grep -v '^$' | wc -l | tr -d ' ')

if [ "$FINAL_COUNT" -eq 1 ]; then
  FINAL_POD=$(echo "$FINAL_PODS" | tr ' ' '\n' | head -1)
  FINAL_STATUS=$(kubectl get pod $FINAL_POD -n intelectgame -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
  echo "✅ Un seul pod telegram-bot en cours d'exécution"
  echo "   Pod: $FINAL_POD"
  echo "   Status: $FINAL_STATUS"
  echo ""
  echo "📋 Pour vérifier les logs:"
  echo "   kubectl logs -f $FINAL_POD -n intelectgame"
else
  echo "⚠️  Attention: $FINAL_COUNT pod(s) encore en cours d'exécution"
  echo "   Pods: $FINAL_PODS"
  echo ""
  echo "💡 Essayez de supprimer manuellement les pods en double:"
  echo "$FINAL_PODS" | tr ' ' '\n' | tail -n +2 | while read pod; do
    if [ -n "$pod" ]; then
      echo "   kubectl delete pod $pod -n intelectgame --force"
    fi
  done
fi

echo ""
echo "✅ Vérification terminée !"

