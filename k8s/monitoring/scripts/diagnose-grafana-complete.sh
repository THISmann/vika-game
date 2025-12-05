#!/bin/bash
# Diagnostic complet de Grafana

set -e

NAMESPACE="intelectgame"

echo "🔍 Diagnostic complet de Grafana..."
echo ""

# 1. Vérifier les pods Grafana
echo "1. Pods Grafana:"
kubectl get pods -n $NAMESPACE -l app=grafana
echo ""

# 2. Vérifier le service Grafana
echo "2. Service Grafana:"
kubectl get svc grafana -n $NAMESPACE
echo ""

# 3. Vérifier les logs Grafana (dernières lignes)
echo "3. Logs Grafana (dernières 20 lignes):"
kubectl logs -n $NAMESPACE -l app=grafana --tail=20 2>&1 | head -30
echo ""

# 4. Vérifier les variables d'environnement Grafana
echo "4. Variables d'environnement Grafana:"
GRAFANA_POD=$(kubectl get pods -n $NAMESPACE -l app=grafana -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$GRAFANA_POD" ]; then
  kubectl exec -n $NAMESPACE $GRAFANA_POD -- env | grep -E "GF_|PATH" || echo "⚠️  Impossible d'exécuter la commande"
else
  echo "❌ Aucun pod Grafana trouvé"
fi
echo ""

# 5. Test de connectivité directe vers Grafana
echo "5. Test de connectivité directe vers Grafana:"
if [ -n "$GRAFANA_POD" ]; then
  echo "   Test depuis le pod Grafana lui-même:"
  kubectl exec -n $NAMESPACE $GRAFANA_POD -- wget -qO- --timeout=3 http://localhost:3000/api/health 2>&1 | head -3 || echo "   ❌ Échec"
  echo ""
  echo "   Test depuis un autre pod (via service):"
  NGINX_POD=$(kubectl get pods -n $NAMESPACE -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
  if [ -n "$NGINX_POD" ]; then
    kubectl exec -n $NAMESPACE $NGINX_POD -- wget -qO- --timeout=5 http://grafana.intelectgame.svc.cluster.local:3000/api/health 2>&1 | head -3 || echo "   ❌ Échec (timeout probable)"
  else
    echo "   ⚠️  Aucun pod nginx-proxy trouvé pour le test"
  fi
else
  echo "   ⚠️  Aucun pod Grafana trouvé"
fi
echo ""

# 6. Vérifier nginx-proxy
echo "6. Configuration nginx-proxy pour Grafana:"
NGINX_POD=$(kubectl get pods -n $NAMESPACE -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$NGINX_POD" ]; then
  echo "   Test de la route /grafana/ depuis nginx-proxy:"
  kubectl exec -n $NAMESPACE $NGINX_POD -- wget -qO- --timeout=5 http://localhost/grafana/api/health 2>&1 | head -5 || echo "   ❌ Échec"
  echo ""
  echo "   Configuration nginx (extrait):"
  kubectl exec -n $NAMESPACE $NGINX_POD -- cat /etc/nginx/nginx.conf 2>/dev/null | grep -A 15 "location /grafana" || echo "   ⚠️  Impossible de lire la configuration"
else
  echo "   ❌ Aucun pod nginx-proxy trouvé"
fi
echo ""

# 7. Vérifier les événements récents
echo "7. Événements récents (Grafana et nginx-proxy):"
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | grep -E "grafana|nginx-proxy" | tail -10 || echo "   Aucun événement récent"
echo ""

# 8. Vérifier les endpoints
echo "8. Endpoints Grafana:"
kubectl get endpoints grafana -n $NAMESPACE
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 SOLUTIONS :"
echo ""
echo "1. Port-Forward direct (RECOMMANDÉ):"
echo "   kubectl port-forward -n $NAMESPACE service/grafana 3000:3000"
echo "   Puis: http://localhost:3000"
echo ""
echo "2. Port-Forward via nginx-proxy:"
echo "   kubectl port-forward -n $NAMESPACE service/nginx-proxy 8080:80"
echo "   Puis: http://localhost:8080/grafana/"
echo ""

