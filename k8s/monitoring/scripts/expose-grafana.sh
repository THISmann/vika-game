#!/bin/bash
# Script pour exposer Grafana publiquement

set -e

echo "🌐 Exposition de Grafana..."

# Option 1: Utiliser minikube tunnel (recommandé pour Minikube)
if command -v minikube &> /dev/null; then
  echo "📡 Utilisation de minikube tunnel..."
  echo "⚠️  Cette commande doit rester active. Ouvrez un nouveau terminal pour continuer."
  echo ""
  echo "Une fois le tunnel actif, accédez à Grafana via:"
  echo "   http://$(minikube ip):3000"
  echo ""
  minikube tunnel
  exit 0
fi

# Option 2: Changer le service en LoadBalancer
echo "🔄 Changement du service Grafana en LoadBalancer..."
kubectl patch service grafana -n intelectgame -p '{"spec":{"type":"LoadBalancer"}}'

echo "⏳ Attente de l'attribution de l'IP externe..."
sleep 10

EXTERNAL_IP=$(kubectl get svc grafana -n intelectgame -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")

if [ -n "$EXTERNAL_IP" ]; then
  echo "✅ Grafana accessible via: http://${EXTERNAL_IP}:3000"
else
  echo "⚠️  IP externe non encore attribuée. Utilisez port-forward en attendant:"
  echo "   kubectl port-forward -n intelectgame service/grafana 3000:3000"
  echo "   Puis accédez à: http://localhost:3000"
fi

