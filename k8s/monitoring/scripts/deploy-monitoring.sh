#!/bin/bash
# Script pour déployer le monitoring avec Grafana + Loki + Promtail

set -e

echo "🚀 Déploiement du monitoring (Grafana + Loki + Promtail)..."
echo ""

# Vérifier que le namespace existe
if ! kubectl get namespace intelectgame &>/dev/null; then
  echo "❌ Namespace 'intelectgame' n'existe pas. Créez-le d'abord."
  exit 1
fi

echo "📦 Déploiement de Loki..."
kubectl apply -f k8s/monitoring/loki-config.yaml
kubectl apply -f k8s/monitoring/loki-deployment.yaml

echo "⏳ Attente que Loki soit prêt..."
kubectl wait --for=condition=ready pod -l app=loki -n intelectgame --timeout=60s || true

echo ""
echo "📦 Déploiement de Promtail..."
kubectl apply -f k8s/monitoring/promtail-config.yaml
kubectl apply -f k8s/monitoring/promtail-daemonset.yaml

echo "⏳ Attente que Promtail soit prêt..."
sleep 10

echo ""
echo "📦 Déploiement de Grafana..."
kubectl apply -f k8s/monitoring/grafana-deployment.yaml

echo "⏳ Attente que Grafana soit prêt..."
kubectl wait --for=condition=ready pod -l app=grafana -n intelectgame --timeout=120s || true

echo ""
echo "✅ Monitoring déployé avec succès !"
echo ""
echo "📊 ACCÈS À GRAFANA :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Si vous êtes sur Minikube local :"
echo "   kubectl port-forward -n intelectgame service/grafana 3000:3000"
echo "   Puis ouvrez: http://localhost:3000"
echo ""
echo "2. Si vous êtes sur une VM avec NodePort :"
echo "   Accédez via: http://<VM_IP>:30300"
echo ""
echo "🔐 CREDENTIALS :"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📋 VÉRIFICATION :"
echo "   kubectl get pods -n intelectgame | grep -E 'loki|promtail|grafana'"
echo "   kubectl logs -n intelectgame -l app=loki"
echo "   kubectl logs -n intelectgame -l app=promtail"

