#!/bin/bash

# Script de diagnostic pour le frontend

set -e

NAMESPACE="intelectgame"

echo "🔍 Diagnostic du frontend..."
echo ""

echo "--- 1. État des pods ---"
kubectl get pods -n $NAMESPACE -l app=frontend
kubectl get pods -n $NAMESPACE -l app=nginx-proxy
echo ""

echo "--- 2. Services ---"
kubectl get svc -n $NAMESPACE | grep -E "(frontend|nginx-proxy)"
echo ""

echo "--- 3. Port-forward actif ---"
ps aux | grep "kubectl port-forward" | grep -v grep || echo "❌ Aucun port-forward actif"
echo ""

echo "--- 4. Test de connexion ---"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 > /dev/null 2>&1; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
  echo "✅ Port-forward actif: http://localhost:5173 (HTTP $HTTP_CODE)"
else
  echo "❌ Port-forward non accessible sur localhost:5173"
fi
echo ""

echo "--- 5. Logs Nginx Proxy (dernières 10 lignes) ---"
kubectl logs -n $NAMESPACE -l app=nginx-proxy --tail=10 2>&1 | tail -10
echo ""

echo "--- 6. Logs Frontend (dernières 10 lignes) ---"
kubectl logs -n $NAMESPACE -l app=frontend --tail=10 2>&1 | tail -10
echo ""

echo "--- 7. Événements récents ---"
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -5
echo ""

echo "💡 Solutions possibles:"
echo "   1. Redémarrer le port-forward: kubectl port-forward -n $NAMESPACE service/nginx-proxy 5173:80"
echo "   2. Vérifier les logs: kubectl logs -n $NAMESPACE -l app=nginx-proxy -f"
echo "   3. Redémarrer le proxy: kubectl rollout restart deployment/nginx-proxy -n $NAMESPACE"

