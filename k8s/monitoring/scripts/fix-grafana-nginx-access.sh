#!/bin/bash
# Script pour corriger l'accès à Grafana via nginx-proxy

set -e

NAMESPACE="intelectgame"
GRAFANA_DEPLOYMENT="grafana"
NGINX_DEPLOYMENT="nginx-proxy"
PUBLIC_IP="82.202.141.248"
NGINX_NODEPORT="30081"

echo "🔧 Correction de l'accès à Grafana via nginx-proxy..."
echo ""

# 1. Mettre à jour Grafana avec la bonne URL
echo "📝 Mise à jour de la configuration Grafana..."
kubectl patch deployment $GRAFANA_DEPLOYMENT -n $NAMESPACE --type='json' -p='[
  {
    "op": "replace",
    "path": "/spec/template/spec/containers/0/env",
    "value": [
      {
        "name": "GF_SECURITY_ADMIN_USER",
        "value": "admin"
      },
      {
        "name": "GF_SECURITY_ADMIN_PASSWORD",
        "value": "admin123"
      },
      {
        "name": "GF_SERVER_ROOT_URL",
        "value": "http://'$PUBLIC_IP':'$NGINX_NODEPORT'/grafana/"
      },
      {
        "name": "GF_SERVER_SERVE_FROM_SUB_PATH",
        "value": "true"
      },
      {
        "name": "GF_INSTALL_PLUGINS",
        "value": ""
      }
    ]
  }
]' || {
  echo "⚠️  Patch échoué, utilisation de kubectl apply..."
  # Alternative: utiliser sed pour modifier le fichier
  sed -i.bak "s|value: \".*grafana/\"|value: \"http://$PUBLIC_IP:$NGINX_NODEPORT/grafana/\"|g" k8s/monitoring/grafana-deployment.yaml
  kubectl apply -f k8s/monitoring/grafana-deployment.yaml -n $NAMESPACE
}

echo "✅ Configuration Grafana mise à jour"
echo ""

# 2. Redémarrer Grafana
echo "🔄 Redémarrage de Grafana..."
kubectl rollout restart deployment/$GRAFANA_DEPLOYMENT -n $NAMESPACE
kubectl wait --for=condition=ready pod -l app=$GRAFANA_DEPLOYMENT -n $NAMESPACE --timeout=120s
if [ $? -ne 0 ]; then
  echo "❌ Le déploiement Grafana n'est pas prêt."
  exit 1
fi
echo "✅ Grafana redémarré"
echo ""

# 3. Vérifier que nginx-proxy est actif
echo "🔍 Vérification de nginx-proxy..."
NGINX_POD=$(kubectl get pods -n $NAMESPACE -l app=$NGINX_DEPLOYMENT -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -z "$NGINX_POD" ]; then
  echo "❌ Aucun pod nginx-proxy trouvé"
  exit 1
fi
NGINX_STATUS=$(kubectl get pod $NGINX_POD -n $NAMESPACE -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
if [ "$NGINX_STATUS" != "Running" ]; then
  echo "⚠️  nginx-proxy n'est pas en cours d'exécution (Status: $NGINX_STATUS)"
else
  echo "✅ nginx-proxy est actif"
fi
echo ""

# 4. Test de connectivité depuis nginx-proxy vers Grafana
echo "🧪 Test de connectivité nginx-proxy → Grafana..."
GRAFANA_TEST=$(kubectl exec -n $NAMESPACE $NGINX_POD -- wget -qO- --timeout=3 http://grafana.intelectgame.svc.cluster.local:3000/api/health 2>&1 | head -1 || echo "FAILED")
if echo "$GRAFANA_TEST" | grep -q "Grafana\|ok"; then
  echo "✅ Grafana accessible depuis nginx-proxy"
else
  echo "⚠️  Grafana non accessible depuis nginx-proxy: $GRAFANA_TEST"
fi
echo ""

# 5. Afficher l'URL d'accès
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Grafana est maintenant accessible via nginx-proxy !"
echo ""
echo "   URL: http://$PUBLIC_IP:$NGINX_NODEPORT/grafana/"
echo ""
echo "🔐 Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Si le port 30081 n'est pas accessible depuis l'extérieur,"
echo "   utilisez port-forward:"
echo "   kubectl port-forward -n $NAMESPACE service/nginx-proxy 8080:80"
echo "   Puis: http://localhost:8080/grafana/"

