#!/bin/bash

# Script pour vérifier que le monitoring fonctionne correctement

set -e

MONITORING_NAMESPACE="monitoring"

echo "🔍 Vérification du monitoring..."
echo ""

# 1. Vérifier Promtail
echo "--- 1. État de Promtail ---"
PROMTAIL_PODS=$(kubectl get pods -n $MONITORING_NAMESPACE -l app=promtail --no-headers 2>/dev/null | wc -l)
if [ "$PROMTAIL_PODS" -gt 0 ]; then
  echo "✅ Promtail: $PROMTAIL_PODS pod(s) déployé(s)"
  kubectl get pods -n $MONITORING_NAMESPACE -l app=promtail
  echo ""
  echo "📋 Derniers logs Promtail:"
  kubectl logs -n $MONITORING_NAMESPACE -l app=promtail --tail=10 2>&1 | tail -5 || echo "⚠️ Pas de logs disponibles"
else
  echo "❌ Promtail non déployé"
fi
echo ""

# 2. Vérifier Loki
echo "--- 2. État de Loki ---"
LOKI_PODS=$(kubectl get pods -n $MONITORING_NAMESPACE -l app=loki --no-headers 2>/dev/null | wc -l)
if [ "$LOKI_PODS" -gt 0 ]; then
  echo "✅ Loki: $LOKI_PODS pod(s) déployé(s)"
  kubectl get pods -n $MONITORING_NAMESPACE -l app=loki
  echo ""
  echo "📋 Test de connexion Loki:"
  LOKI_POD=$(kubectl get pods -n $MONITORING_NAMESPACE -l app=loki -o name 2>/dev/null | head -1 | cut -d/ -f2)
  if [ -n "$LOKI_POD" ]; then
    kubectl exec -n $MONITORING_NAMESPACE $LOKI_POD -- wget -q -O- http://localhost:3100/ready 2>/dev/null && echo "✅ Loki est prêt" || echo "⚠️ Loki ne répond pas"
  fi
else
  echo "❌ Loki non déployé"
fi
echo ""

# 3. Vérifier Prometheus
echo "--- 3. État de Prometheus ---"
PROMETHEUS_PODS=$(kubectl get pods -n $MONITORING_NAMESPACE -l app=prometheus --no-headers 2>/dev/null | wc -l)
if [ "$PROMETHEUS_PODS" -gt 0 ]; then
  echo "✅ Prometheus: $PROMETHEUS_PODS pod(s) déployé(s)"
  kubectl get pods -n $MONITORING_NAMESPACE -l app=prometheus
else
  echo "⚠️ Prometheus non déployé"
fi
echo ""

# 4. Vérifier Grafana
echo "--- 4. État de Grafana ---"
GRAFANA_PODS=$(kubectl get pods -n $MONITORING_NAMESPACE -l app=grafana --no-headers 2>/dev/null | wc -l)
if [ "$GRAFANA_PODS" -gt 0 ]; then
  echo "✅ Grafana: $GRAFANA_PODS pod(s) déployé(s)"
  kubectl get pods -n $MONITORING_NAMESPACE -l app=grafana
  echo ""
  echo "💡 Pour accéder à Grafana:"
  echo "   ./k8s/local/scripts/access-grafana-loki.sh"
  echo "   Ou: kubectl port-forward -n $MONITORING_NAMESPACE service/grafana 3000:3000"
else
  echo "❌ Grafana non déployé"
fi
echo ""

# 5. Vérifier les pods monitorés
echo "--- 5. Pods monitorés (namespace: intelectgame) ---"
MONITORED_PODS=$(kubectl get pods -n intelectgame --no-headers 2>/dev/null | wc -l)
if [ "$MONITORED_PODS" -gt 0 ]; then
  echo "✅ $MONITORED_PODS pod(s) à monitorer:"
  kubectl get pods -n intelectgame -o custom-columns=NAME:.metadata.name,STATUS:.status.phase,APP:.metadata.labels.app | head -10
else
  echo "⚠️ Aucun pod dans le namespace intelectgame"
fi
echo ""

# 6. Test de génération d'un log
echo "--- 6. Test de génération d'un log d'erreur ---"
echo "💡 Pour tester, générez un log d'erreur dans un pod:"
echo "   kubectl exec -it -n intelectgame <pod-name> -- sh -c 'echo \"ERROR: Test error message\" >> /proc/1/fd/1'"
echo "   Puis attendez 10-20 secondes et vérifiez dans Grafana:"
echo "   kubectl port-forward -n $MONITORING_NAMESPACE service/loki 3100:3100 &"
echo "   curl \"http://localhost:3100/loki/api/v1/query_range?query={namespace=\\\"intelectgame\\\"}&limit=10\""
echo ""

echo "✅ Vérification terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Accéder à Grafana: ./k8s/local/scripts/access-grafana-loki.sh"
echo "   2. Vérifier les logs: kubectl port-forward -n $MONITORING_NAMESPACE service/loki 3100:3100 &"
echo "   3. Consulter la documentation: docs/MONITORING_AND_LOGS.md"
