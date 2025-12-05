#!/bin/bash
# Correction finale de nginx pour Grafana

set -e

NAMESPACE="intelectgame"
NGINX_DEPLOYMENT="nginx-proxy"

echo "🔧 Correction finale de nginx pour Grafana..."
echo ""

# 1. Appliquer la configuration nginx corrigée
echo "1. Application de la configuration nginx corrigée..."
kubectl apply -f k8s/nginx-proxy-config.yaml -n $NAMESPACE
if [ $? -ne 0 ]; then
  echo "   ❌ Erreur lors de l'application de la ConfigMap"
  exit 1
fi
echo "   ✅ ConfigMap appliquée"
echo ""

# 2. Redémarrer nginx-proxy
echo "2. Redémarrage de nginx-proxy..."
kubectl rollout restart deployment/$NGINX_DEPLOYMENT -n $NAMESPACE
echo "   ⏳ Attente que nginx-proxy redémarre..."
kubectl wait --for=condition=ready pod -l app=$NGINX_DEPLOYMENT -n $NAMESPACE --timeout=120s
if [ $? -ne 0 ]; then
  echo "   ❌ nginx-proxy n'est pas prêt"
  exit 1
fi
echo "   ✅ nginx-proxy redémarré"
echo ""

# 3. Attendre un peu pour que nginx charge la configuration
echo "3. Attente de la stabilisation (5 secondes)..."
sleep 5
echo ""

# 4. Vérifier la syntaxe nginx
echo "4. Vérification de la syntaxe nginx..."
NGINX_POD=$(kubectl get pods -n $NAMESPACE -l app=$NGINX_DEPLOYMENT -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$NGINX_POD" ]; then
  SYNTAX_CHECK=$(kubectl exec -n $NAMESPACE $NGINX_POD -- nginx -t 2>&1)
  if echo "$SYNTAX_CHECK" | grep -q "successful"; then
    echo "   ✅ Syntaxe nginx correcte"
  else
    echo "   ⚠️  Problème de syntaxe:"
    echo "$SYNTAX_CHECK"
  fi
else
  echo "   ⚠️  Aucun pod nginx-proxy trouvé"
fi
echo ""

# 5. Test de connectivité
echo "5. Tests de connectivité..."
if [ -n "$NGINX_POD" ]; then
  echo "   Test 1: Grafana direct (via service)..."
  GRAFANA_DIRECT=$(kubectl exec -n $NAMESPACE $NGINX_POD -- wget -qO- --timeout=5 http://grafana.intelectgame.svc.cluster.local:3000/api/health 2>&1 | head -3 || echo "FAILED")
  if echo "$GRAFANA_DIRECT" | grep -q "Grafana\|ok\|commit"; then
    echo "   ✅ Grafana accessible directement"
  else
    echo "   ⚠️  Grafana non accessible: $GRAFANA_DIRECT"
  fi
  
  echo ""
  echo "   Test 2: Route /grafana/ via nginx (depuis le pod)..."
  NGINX_ROUTE=$(kubectl exec -n $NAMESPACE $NGINX_POD -- wget -qO- --timeout=10 http://127.0.0.1/grafana/api/health 2>&1 | head -5 || echo "FAILED")
  if echo "$NGINX_ROUTE" | grep -q "Grafana\|ok\|commit"; then
    echo "   ✅ Route /grafana/ fonctionne depuis nginx"
  else
    echo "   ⚠️  Route /grafana/ ne fonctionne pas: $NGINX_ROUTE"
    echo ""
    echo "   📋 Logs nginx (dernières 20 lignes):"
    kubectl logs -n $NAMESPACE $NGINX_POD --tail=20 | grep -E "grafana|error|warn" || kubectl logs -n $NAMESPACE $NGINX_POD --tail=20
  fi
fi
echo ""

# 6. Afficher les informations d'accès
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 ACCÈS À GRAFANA :"
echo ""
echo "Option 1 - Port-Forward via nginx-proxy (RECOMMANDÉ):"
echo "   kubectl port-forward -n $NAMESPACE service/nginx-proxy 8080:80"
echo "   Puis: http://localhost:8080/grafana/"
echo ""
echo "Option 2 - Port-Forward direct vers Grafana:"
echo "   kubectl port-forward -n $NAMESPACE service/grafana 3000:3000"
echo "   Puis: http://localhost:3000"
echo ""
echo "Option 3 - Via nginx-proxy (si port 30081 accessible):"
echo "   http://82.202.141.248:30081/grafana/"
echo ""
echo "🔐 Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Pour analyser les problèmes:"
echo "   ./k8s/monitoring/analyze-nginx-logs.sh"

