#!/bin/bash

# Script pour résoudre le problème de multiples instances du bot Telegram

NAMESPACE="intelectgame"
TELEGRAM_BOT_LABEL="telegram-bot"

echo "🔧 Correction du problème de multiples instances du bot Telegram"
echo ""

# 1. Vérifier l'état actuel des pods
echo "--- 1. État actuel des pods ---"
kubectl get pods -n $NAMESPACE -l app=$TELEGRAM_BOT_LABEL
echo ""

# 2. Compter les pods en cours d'exécution
RUNNING_PODS=$(kubectl get pods -n $NAMESPACE -l app=$TELEGRAM_BOT_LABEL --field-selector=status.phase=Running -o jsonpath='{.items[*].metadata.name}')
TERMINATING_PODS=$(kubectl get pods -n $NAMESPACE -l app=$TELEGRAM_BOT_LABEL --field-selector=status.phase!=Running -o jsonpath='{.items[*].metadata.name}')

RUNNING_COUNT=$(echo $RUNNING_PODS | wc -w)
TERMINATING_COUNT=$(echo $TERMINATING_PODS | wc -w)

echo "--- 2. Analyse ---"
echo "Pods en cours d'exécution: $RUNNING_COUNT"
echo "Pods en cours de termination: $TERMINATING_COUNT"
echo ""

# 3. Si plusieurs pods sont en cours d'exécution, garder seulement le plus récent
if [ $RUNNING_COUNT -gt 1 ]; then
  echo "⚠️ Plusieurs pods en cours d'exécution détectés!"
  echo ""
  echo "Pods en cours d'exécution:"
  for POD in $RUNNING_PODS; do
    AGE=$(kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.metadata.creationTimestamp}')
    echo "  - $POD (créé: $AGE)"
  done
  echo ""
  
  # Trier par date de création et garder le plus récent
  LATEST_POD=$(kubectl get pods -n $NAMESPACE -l app=$TELEGRAM_BOT_LABEL --field-selector=status.phase=Running --sort-by=.metadata.creationTimestamp -o jsonpath='{.items[-1].metadata.name}')
  
  echo "--- 3. Suppression des pods en double ---"
  echo "Pods à supprimer (gardant le plus récent: $LATEST_POD):"
  for POD in $RUNNING_PODS; do
    if [ "$POD" != "$LATEST_POD" ]; then
      echo "  🗑️ Suppression de $POD"
      kubectl delete pod $POD -n $NAMESPACE --grace-period=0 --force
    else
      echo "  ✅ Conservation de $POD (le plus récent)"
    fi
  done
  echo ""
fi

# 4. Supprimer les pods en état Terminating qui traînent
if [ $TERMINATING_COUNT -gt 0 ]; then
  echo "--- 4. Nettoyage des pods en cours de termination ---"
  for POD in $TERMINATING_PODS; do
    echo "  🗑️ Forçage de la suppression de $POD"
    kubectl delete pod $POD -n $NAMESPACE --grace-period=0 --force 2>/dev/null
  done
  echo ""
fi

# 5. Vérifier que le deployment n'a qu'une seule réplique
echo "--- 5. Vérification du nombre de répliques ---"
REPLICAS=$(kubectl get deployment telegram-bot -n $NAMESPACE -o jsonpath='{.spec.replicas}' 2>/dev/null)
echo "Répliques configurées: $REPLICAS"

if [ "$REPLICAS" != "1" ]; then
  echo "⚠️ Le deployment a $REPLICAS répliques. Mise à jour à 1..."
  kubectl scale deployment telegram-bot -n $NAMESPACE --replicas=1
  echo "✅ Nombre de répliques mis à jour à 1"
else
  echo "✅ Le deployment est configuré pour 1 réplique"
fi
echo ""

# 6. Attendre que les pods soient stabilisés
echo "--- 6. Attente que les pods soient stabilisés ---"
sleep 10

# 7. Vérification finale
echo "--- 7. Vérification finale ---"
FINAL_PODS=$(kubectl get pods -n $NAMESPACE -l app=$TELEGRAM_BOT_LABEL --field-selector=status.phase=Running -o jsonpath='{.items[*].metadata.name}')
FINAL_COUNT=$(echo $FINAL_PODS | wc -w)

kubectl get pods -n $NAMESPACE -l app=$TELEGRAM_BOT_LABEL
echo ""

if [ $FINAL_COUNT -eq 1 ]; then
  echo "✅ Un seul pod en cours d'exécution: $FINAL_PODS"
  echo ""
  echo "--- 8. Logs du pod ---"
  kubectl logs $FINAL_PODS -n $NAMESPACE --tail=20
  echo ""
  echo "✅ Problème résolu! Le bot Telegram devrait maintenant fonctionner correctement."
else
  echo "⚠️ Il y a encore $FINAL_COUNT pods en cours d'exécution."
  echo "Attendez quelques secondes et réessayez, ou supprimez manuellement les pods en double."
fi

echo ""
echo "💡 Pour surveiller les logs en temps réel:"
echo "   kubectl logs -f -n $NAMESPACE -l app=$TELEGRAM_BOT_LABEL"

