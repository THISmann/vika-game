#!/bin/bash
# Script pour corriger l'accès à Grafana

set -e

echo "🔍 Vérification de l'accès à Grafana..."
echo ""

# Vérifier le type de service actuel
SERVICE_TYPE=$(kubectl get svc grafana -n intelectgame -o jsonpath='{.spec.type}' 2>/dev/null || echo "not-found")

echo "📊 Type de service actuel: $SERVICE_TYPE"
echo ""

if [ "$SERVICE_TYPE" = "NodePort" ]; then
  echo "🔄 Changement en LoadBalancer pour minikube tunnel..."
  kubectl patch service grafana -n intelectgame -p '{"spec":{"type":"LoadBalancer"}}'
  
  echo "⏳ Attente de l'attribution de l'IP..."
  sleep 5
  
  # Vérifier l'IP externe
  EXTERNAL_IP=$(kubectl get svc grafana -n intelectgame -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
  HOSTNAME=$(kubectl get svc grafana -n intelectgame -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
  
  if [ -n "$EXTERNAL_IP" ]; then
    echo "✅ IP externe attribuée: $EXTERNAL_IP"
    echo "🌐 Accédez à Grafana via: http://$EXTERNAL_IP:3000"
  elif [ -n "$HOSTNAME" ]; then
    echo "✅ Hostname attribué: $HOSTNAME"
    echo "🌐 Accédez à Grafana via: http://$HOSTNAME:3000"
  else
    echo "⚠️  IP externe non encore attribuée."
    echo "   Le tunnel minikube doit être actif."
    echo ""
    echo "📋 Vérifiez le tunnel:"
    echo "   ps aux | grep 'minikube tunnel'"
    echo ""
    echo "   Si le tunnel est actif, attendez quelques secondes et réessayez:"
    echo "   kubectl get svc grafana -n intelectgame"
  fi
elif [ "$SERVICE_TYPE" = "LoadBalancer" ]; then
  EXTERNAL_IP=$(kubectl get svc grafana -n intelectgame -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
  HOSTNAME=$(kubectl get svc grafana -n intelectgame -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
  
  if [ -n "$EXTERNAL_IP" ]; then
    echo "✅ Service LoadBalancer avec IP: $EXTERNAL_IP"
    echo "🌐 Accédez à Grafana via: http://$EXTERNAL_IP:3000"
  elif [ -n "$HOSTNAME" ]; then
    echo "✅ Service LoadBalancer avec hostname: $HOSTNAME"
    echo "🌐 Accédez à Grafana via: http://$HOSTNAME:3000"
  else
    echo "⚠️  Service LoadBalancer mais pas d'IP externe."
    echo "   Vérifiez que minikube tunnel est actif:"
    echo "   ps aux | grep 'minikube tunnel'"
  fi
else
  echo "❌ Service Grafana non trouvé ou type inconnu: $SERVICE_TYPE"
  echo "   Vérifiez que Grafana est déployé:"
  echo "   kubectl get svc -n intelectgame | grep grafana"
fi

echo ""
echo "📋 Informations du service:"
kubectl get svc grafana -n intelectgame

echo ""
echo "💡 Alternative: Port-Forward (pour test local)"
echo "   kubectl port-forward -n intelectgame service/grafana 3000:3000"
echo "   Puis: http://localhost:3000"

