#!/bin/bash
# Script complet pour corriger l'accès à Grafana via nginx-proxy

set -e

NAMESPACE="intelectgame"
GRAFANA_DEPLOYMENT="grafana"
NGINX_DEPLOYMENT="nginx-proxy"
PUBLIC_IP="82.202.141.248"
NGINX_NODEPORT="30081"

echo "🔧 Correction complète de l'accès à Grafana..."
echo ""

# 1. Vérifier que Grafana est en ClusterIP (pas LoadBalancer)
echo "1. Vérification du service Grafana..."
CURRENT_TYPE=$(kubectl get svc grafana -n $NAMESPACE -o jsonpath='{.spec.type}' 2>/dev/null || echo "")
if [ "$CURRENT_TYPE" != "ClusterIP" ]; then
  echo "   ⚠️  Service Grafana est de type $CURRENT_TYPE, changement en ClusterIP..."
  kubectl patch svc grafana -n $NAMESPACE -p '{"spec":{"type":"ClusterIP"}}'
  echo "   ✅ Service Grafana changé en ClusterIP"
else
  echo "   ✅ Service Grafana est déjà en ClusterIP"
fi
echo ""

# 2. Appliquer la configuration Grafana
echo "2. Application de la configuration Grafana..."
kubectl apply -f k8s/monitoring/grafana-deployment.yaml -n $NAMESPACE
echo "   ✅ Configuration appliquée"
echo ""

# 3. Vérifier que les pods Grafana sont prêts
echo "3. Vérification des pods Grafana..."
kubectl wait --for=condition=ready pod -l app=grafana -n $NAMESPACE --timeout=180s || {
  echo "   ⚠️  Les pods Grafana ne sont pas prêts, vérification des logs..."
  GRAFANA_POD=$(kubectl get pods -n $NAMESPACE -l app=grafana -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
  if [ -n "$GRAFANA_POD" ]; then
    echo "   📋 Logs du pod $GRAFANA_POD:"
    kubectl logs -n $NAMESPACE $GRAFANA_POD --tail=30
  fi
  echo "   ⚠️  Continuons malgré tout..."
}
echo ""

# 4. Vérifier nginx-proxy
echo "4. Vérification de nginx-proxy..."
kubectl wait --for=condition=ready pod -l app=nginx-proxy -n $NAMESPACE --timeout=60s || {
  echo "   ❌ nginx-proxy n'est pas prêt"
  exit 1
}
echo "   ✅ nginx-proxy est prêt"
echo ""

# 5. Appliquer la configuration nginx
echo "5. Application de la configuration nginx-proxy..."
kubectl apply -f k8s/nginx-proxy-config.yaml -n $NAMESPACE
kubectl rollout restart deployment/$NGINX_DEPLOYMENT -n $NAMESPACE
kubectl wait --for=condition=ready pod -l app=$NGINX_DEPLOYMENT -n $NAMESPACE --timeout=120s
echo "   ✅ nginx-proxy redémarré"
echo ""

# 6. Attendre un peu pour que tout soit stable
echo "6. Attente de la stabilisation (10 secondes)..."
sleep 10
echo ""

# 7. Test de connectivité
echo "7. Tests de connectivité..."
GRAFANA_POD=$(kubectl get pods -n $NAMESPACE -l app=grafana -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
NGINX_POD=$(kubectl get pods -n $NAMESPACE -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$GRAFANA_POD" ]; then
  echo "   Test 1: Grafana depuis son propre pod..."
  GRAFANA_SELF_TEST=$(kubectl exec -n $NAMESPACE $GRAFANA_POD -- wget -qO- --timeout=5 http://localhost:3000/api/health 2>&1 | head -3 || echo "FAILED")
  if echo "$GRAFANA_SELF_TEST" | grep -q "Grafana\|ok"; then
    echo "   ✅ Grafana répond depuis son pod"
  else
    echo "   ⚠️  Grafana ne répond pas depuis son pod: $GRAFANA_SELF_TEST"
  fi
fi

if [ -n "$NGINX_POD" ] && [ -n "$GRAFANA_POD" ]; then
  echo "   Test 2: Grafana depuis nginx-proxy (via service)..."
  NGINX_TO_GRAFANA=$(kubectl exec -n $NAMESPACE $NGINX_POD -- wget -qO- --timeout=10 http://grafana.intelectgame.svc.cluster.local:3000/api/health 2>&1 | head -3 || echo "FAILED")
  if echo "$NGINX_TO_GRAFANA" | grep -q "Grafana\|ok"; then
    echo "   ✅ Grafana accessible depuis nginx-proxy"
  else
    echo "   ⚠️  Grafana non accessible depuis nginx-proxy: $NGINX_TO_GRAFANA"
  fi
  
  echo "   Test 3: Route /grafana/ depuis nginx-proxy..."
  NGINX_ROUTE_TEST=$(kubectl exec -n $NAMESPACE $NGINX_POD -- wget -qO- --timeout=10 http://localhost/grafana/api/health 2>&1 | head -3 || echo "FAILED")
  if echo "$NGINX_ROUTE_TEST" | grep -q "Grafana\|ok"; then
    echo "   ✅ Route /grafana/ fonctionne"
  else
    echo "   ⚠️  Route /grafana/ ne fonctionne pas: $NGINX_ROUTE_TEST"
  fi
fi
echo ""

# 8. Afficher les informations d'accès
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 ACCÈS À GRAFANA :"
echo ""
echo "Option 1 - Via nginx-proxy (si port 30081 accessible):"
echo "   http://$PUBLIC_IP:$NGINX_NODEPORT/grafana/"
echo ""
echo "Option 2 - Port-Forward via nginx-proxy (RECOMMANDÉ):"
echo "   kubectl port-forward -n $NAMESPACE service/nginx-proxy 8080:80"
echo "   Puis: http://localhost:8080/grafana/"
echo ""
echo "Option 3 - Port-Forward direct vers Grafana:"
echo "   kubectl port-forward -n $NAMESPACE service/grafana 3000:3000"
echo "   Puis: http://localhost:3000"
echo ""
echo "🔐 Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Pour diagnostiquer les problèmes:"
echo "   ./k8s/monitoring/diagnose-grafana-complete.sh"

