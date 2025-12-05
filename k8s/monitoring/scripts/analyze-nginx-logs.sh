#!/bin/bash
# Analyse approfondie des logs nginx et de la configuration

set -e

NAMESPACE="intelectgame"

echo "🔍 Analyse approfondie de nginx-proxy et Grafana..."
echo ""

# 1. Vérifier les logs nginx
echo "1. Logs nginx-proxy (dernières 50 lignes):"
NGINX_POD=$(kubectl get pods -n $NAMESPACE -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$NGINX_POD" ]; then
  kubectl logs -n $NAMESPACE $NGINX_POD --tail=50
else
  echo "   ❌ Aucun pod nginx-proxy trouvé"
fi
echo ""

# 2. Vérifier la configuration nginx chargée
echo "2. Configuration nginx chargée (extrait /grafana):"
if [ -n "$NGINX_POD" ]; then
  kubectl exec -n $NAMESPACE $NGINX_POD -- cat /etc/nginx/nginx.conf 2>/dev/null | grep -A 25 "location /grafana" || echo "   ⚠️  Impossible de lire la configuration"
fi
echo ""

# 3. Tester la résolution DNS depuis nginx
echo "3. Test de résolution DNS depuis nginx-proxy:"
if [ -n "$NGINX_POD" ]; then
  echo "   Résolution de grafana.intelectgame.svc.cluster.local:"
  kubectl exec -n $NAMESPACE $NGINX_POD -- nslookup grafana.intelectgame.svc.cluster.local 2>&1 || echo "   ⚠️  nslookup non disponible, test avec getent..."
  kubectl exec -n $NAMESPACE $NGINX_POD -- getent hosts grafana.intelectgame.svc.cluster.local 2>&1 || echo "   ⚠️  getent non disponible"
fi
echo ""

# 4. Tester la connectivité TCP directe
echo "4. Test de connectivité TCP vers Grafana:"
if [ -n "$NGINX_POD" ]; then
  echo "   Test TCP vers grafana.intelectgame.svc.cluster.local:3000:"
  kubectl exec -n $NAMESPACE $NGINX_POD -- nc -zv grafana.intelectgame.svc.cluster.local 3000 2>&1 || {
    echo "   ⚠️  nc non disponible, test avec wget direct:"
    kubectl exec -n $NAMESPACE $NGINX_POD -- wget -qO- --timeout=5 http://grafana.intelectgame.svc.cluster.local:3000/api/health 2>&1 | head -3 || echo "   ❌ Échec"
  }
fi
echo ""

# 5. Vérifier que nginx écoute sur le bon port
echo "5. Vérification des ports écoutés par nginx:"
if [ -n "$NGINX_POD" ]; then
  kubectl exec -n $NAMESPACE $NGINX_POD -- netstat -tlnp 2>&1 | grep -E "LISTEN|nginx" || {
    kubectl exec -n $NAMESPACE $NGINX_POD -- ss -tlnp 2>&1 | grep -E "LISTEN|nginx" || echo "   ⚠️  netstat/ss non disponible"
  }
fi
echo ""

# 6. Tester nginx depuis l'intérieur du pod
echo "6. Test nginx depuis l'intérieur du pod:"
if [ -n "$NGINX_POD" ]; then
  echo "   Test http://127.0.0.1/ (racine):"
  kubectl exec -n $NAMESPACE $NGINX_POD -- wget -qO- --timeout=3 http://127.0.0.1/ 2>&1 | head -5 || echo "   ⚠️  Échec"
  echo ""
  echo "   Test http://127.0.0.1/grafana/api/health:"
  kubectl exec -n $NAMESPACE $NGINX_POD -- wget -qO- --timeout=5 http://127.0.0.1/grafana/api/health 2>&1 | head -5 || echo "   ⚠️  Échec"
fi
echo ""

# 7. Vérifier les erreurs nginx
echo "7. Recherche d'erreurs dans les logs nginx:"
if [ -n "$NGINX_POD" ]; then
  kubectl logs -n $NAMESPACE $NGINX_POD 2>&1 | grep -i "error\|warn\|fail" | tail -20 || echo "   ✅ Aucune erreur trouvée"
fi
echo ""

# 8. Vérifier la syntaxe de la configuration nginx
echo "8. Vérification de la syntaxe nginx:"
if [ -n "$NGINX_POD" ]; then
  kubectl exec -n $NAMESPACE $NGINX_POD -- nginx -t 2>&1 || echo "   ⚠️  Impossible de tester la syntaxe"
fi
echo ""

# 9. Vérifier les endpoints Grafana
echo "9. Endpoints Grafana:"
kubectl get endpoints grafana -n $NAMESPACE -o wide
echo ""

# 10. Test direct vers l'endpoint Grafana
echo "10. Test direct vers l'endpoint Grafana:"
GRAFANA_ENDPOINT=$(kubectl get endpoints grafana -n $NAMESPACE -o jsonpath='{.subsets[0].addresses[0].ip}:{.subsets[0].ports[0].port}' 2>/dev/null || echo "")
if [ -n "$GRAFANA_ENDPOINT" ] && [ "$GRAFANA_ENDPOINT" != ":" ]; then
  echo "   Endpoint: $GRAFANA_ENDPOINT"
  if [ -n "$NGINX_POD" ]; then
    kubectl exec -n $NAMESPACE $NGINX_POD -- wget -qO- --timeout=5 http://$GRAFANA_ENDPOINT/api/health 2>&1 | head -3 || echo "   ❌ Échec"
  fi
else
  echo "   ⚠️  Aucun endpoint trouvé"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 Analyse terminée"

