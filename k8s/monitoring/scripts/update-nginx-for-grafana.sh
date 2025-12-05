#!/bin/bash
# Script pour mettre à jour nginx-proxy pour exposer Grafana

set -e

echo "🔄 Mise à jour de nginx-proxy pour exposer Grafana..."
echo ""

# Vérifier que nginx-proxy existe
if ! kubectl get deployment nginx-proxy -n intelectgame &>/dev/null; then
  echo "❌ nginx-proxy n'est pas déployé."
  echo "   Déployez-le d'abord avec: kubectl apply -f k8s/nginx-proxy-config.yaml"
  exit 1
fi

echo "📝 Mise à jour de la configuration nginx-proxy..."
kubectl apply -f k8s/nginx-proxy-config.yaml

echo "⏳ Attente que nginx-proxy redémarre..."
sleep 5

echo "🔄 Redémarrage du pod nginx-proxy pour appliquer les changements..."
kubectl rollout restart deployment/nginx-proxy -n intelectgame

echo "⏳ Attente que le pod soit prêt..."
kubectl wait --for=condition=ready pod -l app=nginx-proxy -n intelectgame --timeout=60s || true

echo ""
echo "🔄 Mise à jour de Grafana pour le reverse proxy..."
kubectl apply -f k8s/monitoring/grafana-deployment.yaml

echo "🔄 Redémarrage de Grafana pour appliquer la nouvelle configuration..."
kubectl rollout restart deployment/grafana -n intelectgame

echo "⏳ Attente que Grafana soit prêt..."
kubectl wait --for=condition=ready pod -l app=grafana -n intelectgame --timeout=120s || true

echo ""
echo "✅ nginx-proxy mis à jour !"
echo ""
echo "🌐 ACCÈS À GRAFANA :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Obtenir l'IP publique
VM_IP=$(curl -s ifconfig.me 2>/dev/null || echo "82.202.141.248")

# Obtenir le NodePort de nginx-proxy
NGINX_NODEPORT=$(kubectl get svc nginx-proxy -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "")

if [ -n "$NGINX_NODEPORT" ] && [ "$NGINX_NODEPORT" != "null" ]; then
  echo "✅ Via nginx-proxy (NodePort $NGINX_NODEPORT):"
  echo "   http://$VM_IP:$NGINX_NODEPORT/grafana/"
  echo ""
fi

echo "✅ Alternative - Port-Forward:"
echo "   kubectl port-forward -n intelectgame service/grafana 3000:3000"
echo "   Puis: http://localhost:3000"
echo ""

echo "🔐 Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""

echo "📋 Vérification:"
echo "   kubectl get pods -n intelectgame -l app=nginx-proxy"
echo "   kubectl logs -n intelectgame -l app=nginx-proxy --tail=20"

