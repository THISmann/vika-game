#!/bin/bash
# Script pour diagnostiquer l'accès à Grafana

set -e

echo "🔍 Diagnostic de l'accès à Grafana..."
echo ""

# Vérifier nginx-proxy
echo "1. Vérification de nginx-proxy..."
NGINX_POD=$(kubectl get pods -n intelectgame -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$NGINX_POD" ]; then
  echo "   ✅ Pod nginx-proxy: $NGINX_POD"
  NGINX_STATUS=$(kubectl get pod $NGINX_POD -n intelectgame -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
  echo "   Status: $NGINX_STATUS"
else
  echo "   ❌ Aucun pod nginx-proxy trouvé"
fi

echo ""

# Vérifier le service nginx-proxy
echo "2. Vérification du service nginx-proxy..."
kubectl get svc nginx-proxy -n intelectgame
NGINX_NODEPORT=$(kubectl get svc nginx-proxy -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "")

echo ""

# Vérifier Grafana
echo "3. Vérification de Grafana..."
GRAFANA_POD=$(kubectl get pods -n intelectgame -l app=grafana -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$GRAFANA_POD" ]; then
  echo "   ✅ Pod Grafana: $GRAFANA_POD"
  GRAFANA_STATUS=$(kubectl get pod $GRAFANA_POD -n intelectgame -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
  echo "   Status: $GRAFANA_STATUS"
else
  echo "   ❌ Aucun pod Grafana trouvé"
fi

echo ""

# Test depuis l'intérieur du cluster
if [ -n "$NGINX_POD" ]; then
  echo "4. Test depuis l'intérieur du cluster..."
  echo "   Test nginx-proxy → Grafana..."
  GRAFANA_TEST=$(kubectl exec -n intelectgame $NGINX_POD -- wget -qO- --timeout=3 http://grafana.intelectgame.svc.cluster.local:3000/api/health 2>&1 | head -1 || echo "FAILED")
  if echo "$GRAFANA_TEST" | grep -q "Grafana"; then
    echo "   ✅ Grafana accessible depuis nginx-proxy"
  else
    echo "   ⚠️  Grafana non accessible: $GRAFANA_TEST"
  fi
  
  echo "   Test route /grafana/..."
  NGINX_TEST=$(kubectl exec -n intelectgame $NGINX_POD -- wget -qO- --timeout=3 http://localhost/grafana/api/health 2>&1 | head -1 || echo "FAILED")
  if echo "$NGINX_TEST" | grep -q "Grafana\|ok"; then
    echo "   ✅ Route /grafana/ fonctionne"
  else
    echo "   ⚠️  Route /grafana/ ne fonctionne pas: $NGINX_TEST"
  fi
fi

echo ""

# Test local
echo "5. Test local..."
if [ -n "$NGINX_NODEPORT" ] && [ "$NGINX_NODEPORT" != "null" ]; then
  MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "")
  if [ -n "$MINIKUBE_IP" ]; then
    echo "   Test http://$MINIKUBE_IP:$NGINX_NODEPORT/grafana/..."
    LOCAL_TEST=$(curl -s --connect-timeout 3 http://$MINIKUBE_IP:$NGINX_NODEPORT/grafana/api/health 2>&1 || echo "FAILED")
    if echo "$LOCAL_TEST" | grep -q "Grafana\|ok"; then
      echo "   ✅ Accessible localement"
    else
      echo "   ⚠️  Non accessible localement: $LOCAL_TEST"
    fi
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 SOLUTIONS :"
echo ""
echo "1. Port-Forward (RECOMMANDÉ - Fonctionne toujours):"
echo "   kubectl port-forward -n intelectgame service/grafana 3000:3000"
echo "   Puis: http://localhost:3000"
echo ""
echo "2. Port-Forward via nginx-proxy:"
echo "   kubectl port-forward -n intelectgame service/nginx-proxy 8080:80"
echo "   Puis: http://localhost:8080/grafana/"
echo ""
echo "3. Vérifier les logs nginx-proxy:"
echo "   kubectl logs -n intelectgame -l app=nginx-proxy --tail=50"
echo ""
echo "4. Vérifier la configuration nginx:"
echo "   kubectl exec -n intelectgame $NGINX_POD -- cat /etc/nginx/nginx.conf | grep -A 10 grafana"

