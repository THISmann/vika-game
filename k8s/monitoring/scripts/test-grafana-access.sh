#!/bin/bash
# Script pour tester l'accès à Grafana

set -e

echo "🧪 Test d'accès à Grafana..."
echo ""

# Obtenir l'IP publique
VM_IP=$(curl -s ifconfig.me 2>/dev/null || echo "82.202.141.248")
NODEPORT=$(kubectl get svc grafana -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "")

echo "📊 Informations:"
echo "   VM IP: $VM_IP"
echo "   NodePort: $NODEPORT"
echo ""

# Test 1: Localhost (port-forward)
echo "1. Test localhost:3000 (port-forward)..."
if curl -s --connect-timeout 2 http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "   ✅ Accessible via localhost:3000"
else
  echo "   ❌ Non accessible (port-forward non actif)"
fi
echo ""

# Test 2: Via NodePort
if [ -n "$NODEPORT" ] && [ "$NODEPORT" != "null" ]; then
  echo "2. Test $VM_IP:$NODEPORT (NodePort)..."
  if curl -s --connect-timeout 3 http://$VM_IP:$NODEPORT/api/health > /dev/null 2>&1; then
    echo "   ✅ Accessible via http://$VM_IP:$NODEPORT"
  else
    echo "   ❌ Non accessible (firewall probablement fermé)"
  fi
  echo ""
fi

# Test 3: Via LoadBalancer
echo "3. Test $VM_IP:3000 (LoadBalancer)..."
if curl -s --connect-timeout 3 http://$VM_IP:3000/api/health > /dev/null 2>&1; then
  echo "   ✅ Accessible via http://$VM_IP:3000"
else
  echo "   ❌ Non accessible (firewall probablement fermé)"
fi
echo ""

# Vérifier le firewall
echo "📋 Statut du firewall:"
sudo ufw status | head -5 || echo "   ufw non disponible"
echo ""

# Vérifier que Grafana est prêt
echo "📦 Statut du pod Grafana:"
kubectl get pods -n intelectgame -l app=grafana
echo ""

echo "💡 SOLUTION :"
echo "   Si tous les tests échouent, utilisez port-forward:"
echo "   kubectl port-forward -n intelectgame service/grafana 3000:3000"

