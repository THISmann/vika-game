#!/bin/bash
# Script pour vérifier et gérer le tunnel minikube

set -e

echo "🔍 Vérification du tunnel minikube..."
echo ""

# Vérifier si un tunnel est actif
TUNNEL_PID=$(pgrep -f "minikube tunnel" || echo "")

if [ -n "$TUNNEL_PID" ]; then
  echo "✅ Tunnel minikube actif (PID: $TUNNEL_PID)"
  echo ""
  echo "📊 Services avec LoadBalancer:"
  kubectl get svc -A -o wide | grep LoadBalancer || echo "   Aucun service LoadBalancer trouvé"
  echo ""
  echo "🌐 Pour accéder à Grafana, utilisez l'IP du LoadBalancer:"
  kubectl get svc grafana -n intelectgame -o wide
  echo ""
  EXTERNAL_IP=$(kubectl get svc grafana -n intelectgame -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
  if [ -n "$EXTERNAL_IP" ]; then
    echo "✅ Grafana accessible via: http://$EXTERNAL_IP:3000"
  else
    echo "⚠️  IP externe non encore attribuée. Attendez quelques secondes."
  fi
else
  echo "❌ Aucun tunnel minikube actif"
  echo ""
  echo "🚀 Pour démarrer le tunnel:"
  echo "   minikube tunnel"
  echo ""
  echo "   Ou utilisez port-forward:"
  echo "   kubectl port-forward -n intelectgame service/grafana 3000:3000"
fi

