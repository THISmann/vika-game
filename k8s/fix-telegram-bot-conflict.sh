#!/bin/bash
# Script pour résoudre le conflit 409 du bot Telegram
# L'erreur 409 indique qu'il y a plusieurs instances du bot qui tournent

set -e

echo "🔍 Vérification des pods telegram-bot..."

# Vérifier tous les pods telegram-bot
PODS=$(kubectl get pods -n intelectgame -l app=telegram-bot -o jsonpath='{.items[*].metadata.name}')

if [ -z "$PODS" ]; then
  echo "❌ Aucun pod telegram-bot trouvé"
  exit 1
fi

echo "📦 Pods trouvés:"
echo "$PODS" | tr ' ' '\n' | while read pod; do
  if [ -n "$pod" ]; then
    STATUS=$(kubectl get pod $pod -n intelectgame -o jsonpath='{.status.phase}')
    echo "   - $pod (Status: $STATUS)"
  fi
done

echo ""
echo "🔧 Solution: S'assurer qu'il n'y a qu'un seul pod actif"
echo ""

# Vérifier le nombre de replicas
REPLICAS=$(kubectl get deployment telegram-bot -n intelectgame -o jsonpath='{.spec.replicas}')
echo "📊 Nombre de replicas configuré: $REPLICAS"

if [ "$REPLICAS" != "1" ]; then
  echo "⚠️  Le nombre de replicas n'est pas 1. Correction..."
  kubectl scale deployment telegram-bot --replicas=1 -n intelectgame
  echo "✅ Nombre de replicas mis à 1"
fi

echo ""
echo "🔄 Suppression des pods en double..."
# Supprimer tous les pods sauf le plus récent
POD_COUNT=$(echo "$PODS" | tr ' ' '\n' | grep -v '^$' | wc -l | tr -d ' ')

if [ "$POD_COUNT" -gt 1 ]; then
  echo "⚠️  Plusieurs pods détectés. Suppression des anciens pods..."
  
  # Garder seulement le pod le plus récent
  LATEST_POD=$(kubectl get pods -n intelectgame -l app=telegram-bot --sort-by=.metadata.creationTimestamp -o jsonpath='{.items[-1].metadata.name}')
  
  echo "$PODS" | tr ' ' '\n' | while read pod; do
    if [ -n "$pod" ] && [ "$pod" != "$LATEST_POD" ]; then
      echo "   🗑️  Suppression de $pod..."
      kubectl delete pod $pod -n intelectgame --grace-period=0 --force 2>/dev/null || true
    fi
  done
  
  echo "✅ Anciens pods supprimés"
fi

echo ""
echo "⏳ Attente que le pod soit prêt..."
kubectl wait --for=condition=ready pod -l app=telegram-bot -n intelectgame --timeout=60s || true

echo ""
echo "✅ Vérification finale..."
FINAL_PODS=$(kubectl get pods -n intelectgame -l app=telegram-bot -o jsonpath='{.items[*].metadata.name}')
FINAL_COUNT=$(echo "$FINAL_PODS" | tr ' ' '\n' | grep -v '^$' | wc -l | tr -d ' ')

if [ "$FINAL_COUNT" -eq 1 ]; then
  echo "✅ Un seul pod telegram-bot en cours d'exécution"
  echo "   Pod: $(echo $FINAL_PODS | tr ' ' '\n' | head -1)"
else
  echo "⚠️  Attention: $FINAL_COUNT pod(s) encore en cours d'exécution"
  echo "   Pods: $FINAL_PODS"
fi

echo ""
echo "📋 Vérification des logs..."
echo "   Commande: kubectl logs -f deployment/telegram-bot -n intelectgame"
echo ""
echo "✅ Correction terminée !"

