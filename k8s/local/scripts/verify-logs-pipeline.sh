#!/bin/bash

# Script pour vérifier que tous les microservices envoient les logs à Loki

set -e

echo "🔍 Vérification du pipeline de logs..."
echo ""

echo "--- 1. État de Promtail ---"
kubectl get pods -n monitoring -l app=promtail
echo ""

echo "--- 2. État de Loki ---"
kubectl get pods -n monitoring -l app=loki
echo ""

echo "--- 3. Logs Promtail (dernières 10 lignes) ---"
kubectl logs -n monitoring -l app=promtail --tail=10 2>&1 | tail -10 || echo "⚠️ Aucun pod Promtail trouvé"
echo ""

echo "--- 4. Logs Loki (dernières 10 lignes) ---"
kubectl logs -n monitoring -l app=loki --tail=10 2>&1 | tail -10 || echo "⚠️ Aucun pod Loki trouvé"
echo ""

echo "--- 5. Vérification Loki (labels) ---"
LOKI_POD=$(kubectl get pods -n monitoring -l app=loki -o name 2>/dev/null | head -1 | cut -d/ -f2)
if [ -n "$LOKI_POD" ]; then
  kubectl exec -n monitoring $LOKI_POD -- wget -q -O- http://localhost:3100/loki/api/v1/labels 2>/dev/null | jq '.' || echo "⚠️ Impossible de se connecter à Loki"
else
  echo "⚠️ Aucun pod Loki trouvé"
fi
echo ""

echo "--- 6. Vérification des microservices ---"
echo "Microservices dans intelectgame:"
kubectl get pods -n intelectgame -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}' | grep -E "(auth|quiz|game|frontend|telegram|nginx)" | while read pod; do
  echo "  - $pod"
done
echo ""

echo "💡 Pour voir les logs en temps réel:"
echo "   kubectl logs -f -n monitoring -l app=promtail"
echo "   kubectl logs -f -n monitoring -l app=loki"
