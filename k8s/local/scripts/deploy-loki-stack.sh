#!/bin/bash

# Script pour déployer la stack Loki + Prometheus + Grafana

set -e

NAMESPACE="monitoring"
CHART_PATH="./k8s/local/helm/loki-stack"

echo "🚀 Déploiement de la stack Loki + Prometheus + Grafana..."
echo ""

# 1. Vérifier que Helm est installé
if ! command -v helm &> /dev/null; then
  echo "❌ Helm n'est pas installé"
  exit 1
fi

# 2. Créer le namespace si nécessaire
echo "--- 1. Création du namespace ---"
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
echo "✅ Namespace $NAMESPACE créé/vérifié"
echo ""

# 3. Déployer la stack
echo "--- 2. Déploiement avec Helm ---"
cd "$(dirname "$0")/../../.."
helm upgrade --install loki-stack $CHART_PATH -n $NAMESPACE --create-namespace
echo ""

# 4. Attendre que les pods démarrent
echo "--- 3. Attente du démarrage (max 120s) ---"
kubectl wait --for=condition=ready pod -n $NAMESPACE -l app=loki --timeout=120s || echo "⚠️ Loki ne démarre pas dans les temps"
kubectl wait --for=condition=ready pod -n $NAMESPACE -l app=prometheus --timeout=120s || echo "⚠️ Prometheus ne démarre pas dans les temps"
kubectl wait --for=condition=ready pod -n $NAMESPACE -l app=grafana --timeout=120s || echo "⚠️ Grafana ne démarre pas dans les temps"
echo ""

# 5. Vérifier l'état
echo "--- 4. État des pods ---"
kubectl get pods -n $NAMESPACE
echo ""

# 6. Vérifier les services
echo "--- 5. Services ---"
kubectl get svc -n $NAMESPACE
echo ""

echo "✅ Déploiement terminé!"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Accéder à Grafana: kubectl port-forward -n $NAMESPACE service/grafana 3000:3000"
echo "   2. Ouvrir: http://localhost:3000 (admin/admin)"
echo "   3. Vérifier les datasources: Configuration > Data Sources"
echo "   4. Consulter les dashboards: Dashboards > Browse"

