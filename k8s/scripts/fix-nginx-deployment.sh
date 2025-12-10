#!/bin/bash

# Script pour corriger le déploiement Nginx bloqué
# Usage: ./k8s/scripts/fix-nginx-deployment.sh

set -e

NAMESPACE="intelectgame"

echo "🔧 Correction du déploiement Nginx..."
echo ""

# 1. Diagnostiquer le problème
echo "🔍 1. Diagnostic du problème..."
./k8s/scripts/diagnose-nginx.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 2. Supprimer le pod bloqué
echo "🗑️  2. Suppression du pod bloqué..."
NGINX_POD=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$NGINX_POD" ]; then
    echo "   Suppression du pod: $NGINX_POD"
    kubectl delete pod "$NGINX_POD" -n "$NAMESPACE" --force --grace-period=0 2>/dev/null || true
    sleep 3
fi

# 3. Vérifier la configuration Nginx
echo ""
echo "✅ 3. Vérification de la configuration Nginx..."
if kubectl get configmap nginx-proxy-config -n "$NAMESPACE" &> /dev/null; then
    echo "   ✅ ConfigMap existe"
    
    # Vérifier la syntaxe de la configuration
    echo "   Vérification de la syntaxe..."
    NGINX_CONFIG=$(kubectl get configmap nginx-proxy-config -n "$NAMESPACE" -o jsonpath='{.data.nginx\.conf}')
    
    # Créer un pod temporaire pour tester la configuration
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: nginx-test-config
  namespace: $NAMESPACE
spec:
  containers:
  - name: nginx
    image: nginx:alpine
    command: ["/bin/sh", "-c", "echo '$NGINX_CONFIG' > /tmp/nginx.conf && nginx -t -c /tmp/nginx.conf && echo 'Configuration valide' || echo 'Configuration invalide'"]
  restartPolicy: Never
EOF

    echo "   Attente du résultat du test..."
    sleep 5
    
    if kubectl logs nginx-test-config -n "$NAMESPACE" 2>/dev/null | grep -q "Configuration valide"; then
        echo "   ✅ Configuration Nginx valide"
    else
        echo "   ❌ Configuration Nginx invalide"
        echo "   Erreurs:"
        kubectl logs nginx-test-config -n "$NAMESPACE" 2>/dev/null || true
    fi
    
    # Nettoyer le pod de test
    kubectl delete pod nginx-test-config -n "$NAMESPACE" 2>/dev/null || true
else
    echo "   ❌ ConfigMap n'existe pas"
    echo "   Création de la ConfigMap..."
    kubectl apply -f k8s/nginx-proxy-config.yaml
fi

# 4. Redémarrer le deployment
echo ""
echo "🔄 4. Redémarrage du deployment..."
kubectl rollout restart deployment/nginx-proxy -n "$NAMESPACE"

# 5. Attendre avec timeout plus court
echo ""
echo "⏳ 5. Attente du démarrage (timeout: 60s)..."
if kubectl rollout status deployment/nginx-proxy -n "$NAMESPACE" --timeout=60s 2>/dev/null; then
    echo "   ✅ Nginx démarré avec succès"
else
    echo "   ⚠️  Timeout - Vérification manuelle nécessaire"
    echo ""
    echo "   État actuel:"
    kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy
    echo ""
    echo "   Pour plus de détails:"
    echo "   ./k8s/scripts/diagnose-nginx.sh"
fi

echo ""
echo "✅ Correction terminée"
echo ""

