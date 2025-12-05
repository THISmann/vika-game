#!/bin/bash
# Script pour ouvrir l'accès public à Grafana

set -e

echo "🔓 Ouverture de l'accès public à Grafana..."
echo ""

# Vérifier si ufw est actif
if ! command -v ufw &> /dev/null; then
  echo "❌ ufw n'est pas installé. Installation..."
  sudo apt-get update
  sudo apt-get install -y ufw
fi

# Vérifier le statut du firewall
UFW_STATUS=$(sudo ufw status | head -1 | grep -o "active\|inactive" || echo "inactive")

echo "📊 Statut du firewall: $UFW_STATUS"
echo ""

# Obtenir le NodePort si disponible
NODEPORT=$(kubectl get svc grafana -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "")

if [ -n "$NODEPORT" ] && [ "$NODEPORT" != "null" ]; then
  echo "🔓 Ouverture du port NodePort $NODEPORT..."
  sudo ufw allow $NODEPORT/tcp comment "Grafana NodePort"
fi

echo "🔓 Ouverture du port 3000 (Grafana)..."
sudo ufw allow 3000/tcp comment "Grafana LoadBalancer"

echo ""
echo "🔄 Rechargement du firewall..."
sudo ufw reload

echo ""
echo "📊 Règles du firewall:"
sudo ufw status numbered | grep -E "(3000|30300|grafana)" || echo "   (Aucune règle spécifique trouvée)"

echo ""
echo "⏳ Attente de quelques secondes pour que les règles soient appliquées..."
sleep 3

# Obtenir l'IP publique de la VM
VM_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo ""
echo "✅ Ports ouverts !"
echo ""
echo "🌐 ACCÈS À GRAFANA :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -n "$NODEPORT" ] && [ "$NODEPORT" != "null" ]; then
  echo "1. Via NodePort:"
  echo "   http://$VM_IP:$NODEPORT"
  echo ""
fi

echo "2. Via LoadBalancer:"
echo "   http://$VM_IP:3000"
echo ""

echo "3. Alternative - Port-Forward (si accès public ne fonctionne pas):"
echo "   kubectl port-forward -n intelectgame service/grafana 3000:3000"
echo "   Puis: http://localhost:3000"
echo ""

echo "🔐 Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""

echo "🧪 Test de connexion..."
if curl -s --connect-timeout 3 http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "✅ Grafana répond sur localhost:3000"
else
  echo "⚠️  Grafana ne répond pas encore. Vérifiez:"
  echo "   kubectl get pods -n intelectgame -l app=grafana"
  echo "   kubectl logs -n intelectgame -l app=grafana --tail=20"
fi

