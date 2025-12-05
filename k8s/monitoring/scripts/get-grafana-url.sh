#!/bin/bash
# Script pour obtenir l'URL d'accès à Grafana

set -e

echo "🔍 Recherche de l'URL d'accès à Grafana..."
echo ""

# Méthode 1: Vérifier l'IP du LoadBalancer
EXTERNAL_IP=$(kubectl get svc grafana -n intelectgame -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
HOSTNAME=$(kubectl get svc grafana -n intelectgame -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")

# Méthode 2: Obtenir l'IP du node minikube
MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "")

# Méthode 3: Obtenir l'IP publique de la VM (si disponible)
VM_PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "")

echo "📊 Informations du service:"
kubectl get svc grafana -n intelectgame

echo ""
echo "🌐 OPTIONS D'ACCÈS :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Option 1: Port-Forward (toujours fonctionnel)
echo "1. ✅ Port-Forward (RECOMMANDÉ - Fonctionne toujours):"
echo "   kubectl port-forward -n intelectgame service/grafana 3000:3000"
echo "   Puis: http://localhost:3000"
echo ""

# Option 2: Via l'IP du LoadBalancer
if [ -n "$EXTERNAL_IP" ] && [ "$EXTERNAL_IP" != "10.100.231.94" ]; then
  echo "2. ✅ Via LoadBalancer IP:"
  echo "   http://$EXTERNAL_IP:3000"
  echo ""
elif [ -n "$MINIKUBE_IP" ]; then
  echo "2. ⚠️  Via Minikube IP (si tunnel actif):"
  echo "   http://$MINIKUBE_IP:3000"
  echo "   (Vérifiez que minikube tunnel est actif)"
  echo ""
fi

# Option 3: Via l'IP publique de la VM
if [ -n "$VM_PUBLIC_IP" ]; then
  echo "3. ⚠️  Via IP publique de la VM:"
  echo "   http://$VM_PUBLIC_IP:3000"
  echo "   (Nécessite que le port 3000 soit ouvert dans le firewall)"
  echo ""
fi

# Option 4: Via NodePort (si disponible)
NODEPORT=$(kubectl get svc grafana -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "")
if [ -n "$NODEPORT" ] && [ "$NODEPORT" != "null" ]; then
  if [ -n "$VM_PUBLIC_IP" ]; then
    echo "4. ⚠️  Via NodePort (si firewall ouvert):"
    echo "   http://$VM_PUBLIC_IP:$NODEPORT"
    echo ""
  fi
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 RECOMMANDATION :"
echo "   Utilisez port-forward pour un accès rapide et fiable"
echo ""
echo "🔐 Credentials:"
echo "   Username: admin"
echo "   Password: admin123"

