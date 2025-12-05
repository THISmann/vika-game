#!/bin/bash
# Test de Grafana depuis l'extérieur du cluster

set -e

NAMESPACE="intelectgame"
NGINX_NODEPORT="30081"
PUBLIC_IP="82.202.141.248"

echo "🧪 Test de Grafana depuis l'extérieur du cluster..."
echo ""

# 1. Test direct vers Grafana (port-forward)
echo "1. Test via port-forward direct vers Grafana:"
echo "   (Dans un autre terminal, exécutez: kubectl port-forward -n $NAMESPACE service/grafana 3000:3000)"
echo "   Puis testez: curl http://localhost:3000/api/health"
echo ""

# 2. Test via port-forward nginx-proxy
echo "2. Test via port-forward nginx-proxy:"
echo "   (Dans un autre terminal, exécutez: kubectl port-forward -n $NAMESPACE service/nginx-proxy 8080:80)"
echo "   Puis testez: curl http://localhost:8080/grafana/api/health"
echo ""

# 3. Test via NodePort (si accessible)
echo "3. Test via NodePort (si le port est accessible):"
echo "   Test: curl http://$PUBLIC_IP:$NGINX_NODEPORT/grafana/api/health"
curl -s --connect-timeout 5 http://$PUBLIC_IP:$NGINX_NODEPORT/grafana/api/health 2>&1 | head -5 || {
  echo "   ❌ Port $NGINX_NODEPORT non accessible (firewall probablement)"
  echo "   💡 Utilisez port-forward à la place"
}
echo ""

# 4. Vérifier que nginx-proxy écoute bien
echo "4. Vérification que nginx-proxy écoute:"
NGINX_POD=$(kubectl get pods -n $NAMESPACE -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$NGINX_POD" ]; then
  echo "   Pod nginx-proxy: $NGINX_POD"
  echo "   Test depuis le pod vers lui-même (port 80):"
  kubectl exec -n $NAMESPACE $NGINX_POD -- wget -qO- --timeout=3 http://127.0.0.1:80/ 2>&1 | head -5 || echo "   ⚠️  Nginx ne répond pas sur localhost:80"
else
  echo "   ❌ Aucun pod nginx-proxy trouvé"
fi
echo ""

# 5. Vérifier le service nginx-proxy
echo "5. Informations du service nginx-proxy:"
kubectl get svc nginx-proxy -n $NAMESPACE
echo ""

# 6. Test depuis un autre pod vers nginx-proxy
echo "6. Test depuis un autre pod vers nginx-proxy:"
GRAFANA_POD=$(kubectl get pods -n $NAMESPACE -l app=grafana -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$GRAFANA_POD" ]; then
  echo "   Test depuis Grafana vers nginx-proxy:"
  kubectl exec -n $NAMESPACE $GRAFANA_POD -- wget -qO- --timeout=5 http://nginx-proxy.intelectgame.svc.cluster.local:80/ 2>&1 | head -5 || echo "   ⚠️  Nginx non accessible depuis Grafana"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 RECOMMANDATION :"
echo ""
echo "Utilisez port-forward pour un accès fiable:"
echo "   kubectl port-forward -n $NAMESPACE service/nginx-proxy 8080:80"
echo "   Puis: http://localhost:8080/grafana/"
echo ""

