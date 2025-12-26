#!/bin/bash

# Script pour lancer tous les dashboards en arrière-plan

set -e

NAMESPACE="monitoring"

echo "🚀 Lancement de tous les dashboards..."
echo ""

# Arrêter les port-forwards existants
echo "🧹 Nettoyage des port-forwards existants..."
pkill -f "kubectl port-forward.*grafana.*3000" 2>/dev/null || true
pkill -f "kubectl port-forward.*prometheus.*9090" 2>/dev/null || true
sleep 1

# Grafana
if kubectl get service grafana -n $NAMESPACE &> /dev/null; then
  echo "📊 Démarrage de Grafana..."
  kubectl port-forward -n $NAMESPACE service/grafana 3000:3000 > /tmp/grafana-port-forward.log 2>&1 &
  GRAFANA_PID=$!
  sleep 2
  if ps -p $GRAFANA_PID > /dev/null; then
    echo "✅ Grafana: http://localhost:3000 (admin/admin)"
  else
    echo "⚠️  Grafana n'a pas démarré, vérifiez: tail -f /tmp/grafana-port-forward.log"
  fi
else
  echo "⚠️  Grafana non trouvé dans le namespace $NAMESPACE"
fi
echo ""

# Prometheus
if kubectl get service prometheus -n $NAMESPACE &> /dev/null; then
  echo "📈 Démarrage de Prometheus..."
  kubectl port-forward -n $NAMESPACE service/prometheus 9090:9090 > /tmp/prometheus-port-forward.log 2>&1 &
  PROMETHEUS_PID=$!
  sleep 2
  if ps -p $PROMETHEUS_PID > /dev/null; then
    echo "✅ Prometheus: http://localhost:9090"
  else
    echo "⚠️  Prometheus n'a pas démarré, vérifiez: tail -f /tmp/prometheus-port-forward.log"
  fi
else
  echo "⚠️  Prometheus non trouvé dans le namespace $NAMESPACE"
fi
echo ""

echo "✅ Dashboards lancés!"
echo ""
echo "📋 URLs:"
echo "   - Grafana:    http://localhost:3000 (admin/admin)"
echo "   - Prometheus: http://localhost:9090"
echo ""
echo "📋 Commandes utiles:"
echo "   # Voir les logs des port-forwards"
echo "   tail -f /tmp/grafana-port-forward.log"
echo "   tail -f /tmp/prometheus-port-forward.log"
echo ""
echo "   # Arrêter tous les port-forwards"
echo "   pkill -f 'kubectl port-forward.*grafana'"
echo "   pkill -f 'kubectl port-forward.*prometheus'"
echo ""
echo "   # Vérifier les processus"
echo "   ps aux | grep 'kubectl port-forward' | grep -v grep"

