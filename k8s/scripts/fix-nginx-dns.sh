#!/bin/bash

# Script pour corriger le resolver DNS dans Nginx
# Usage: ./k8s/fix-nginx-dns.sh

set -e

echo "🔧 Correction du resolver DNS dans Nginx..."
echo ""

# 1. Obtenir l'adresse IP du resolver DNS depuis le pod
echo "=== 1. Détection de l'adresse IP du resolver DNS ==="
RESOLVER_IP=$(kubectl exec -n intelectgame deployment/nginx-proxy -- cat /etc/resolv.conf 2>/dev/null | grep nameserver | awk '{print $2}' | head -1)

if [ -z "$RESOLVER_IP" ]; then
    # Essayer de trouver le service DNS de Kubernetes
    RESOLVER_IP=$(kubectl get svc -n kube-system -o jsonpath='{.items[?(@.metadata.name=="kube-dns")].spec.clusterIP}' 2>/dev/null || \
                  kubectl get svc -n kube-system -o jsonpath='{.items[?(@.metadata.name=="coredns")].spec.clusterIP}' 2>/dev/null || \
                  echo "")
    if [ -z "$RESOLVER_IP" ]; then
        RESOLVER_IP=$(kubectl get svc -n kube-system | grep -E 'kube-dns|coredns' | awk '{print $3}' | head -1)
    fi
fi

if [ -z "$RESOLVER_IP" ]; then
    echo "❌ Impossible de détecter l'adresse IP du resolver DNS"
    echo "Utilisation de l'adresse par défaut: 10.96.0.10"
    RESOLVER_IP="10.96.0.10"
else
    echo "✅ Adresse IP du resolver DNS détectée: $RESOLVER_IP"
fi
echo ""

# 2. Tester la résolution DNS avec cette adresse
echo "=== 2. Test de résolution DNS ==="
kubectl exec -n intelectgame deployment/nginx-proxy -- nslookup frontend.intelectgame.svc.cluster.local $RESOLVER_IP 2>&1 | head -10
echo ""

# 3. Mettre à jour le ConfigMap avec la bonne adresse IP
echo "=== 3. Mise à jour de la configuration Nginx ==="
CURRENT_RESOLVER=$(kubectl get configmap nginx-proxy-config -n intelectgame -o jsonpath='{.data.nginx\.conf}' | grep -oP 'resolver \K[0-9.]+' | head -1)

if [ "$CURRENT_RESOLVER" = "$RESOLVER_IP" ]; then
    echo "ℹ️  Le resolver DNS est déjà configuré avec la bonne adresse IP"
else
    echo "📝 Mise à jour du resolver DNS de $CURRENT_RESOLVER vers $RESOLVER_IP..."
    
    # Obtenir le ConfigMap actuel
    kubectl get configmap nginx-proxy-config -n intelectgame -o yaml > /tmp/nginx-config.yaml
    
    # Remplacer l'adresse IP du resolver
    sed -i "s/resolver [0-9.]*;/resolver $RESOLVER_IP;/" /tmp/nginx-config.yaml
    
    # Appliquer la mise à jour
    kubectl apply -f /tmp/nginx-config.yaml
    
    echo "✅ Configuration mise à jour"
fi
echo ""

# 4. Redémarrer le pod Nginx
echo "=== 4. Redémarrage du pod Nginx ==="
kubectl rollout restart deployment/nginx-proxy -n intelectgame
echo "⏳ Attente du redémarrage..."
sleep 10

# Attendre que le pod soit prêt
kubectl wait --for=condition=ready pod -l app=nginx-proxy -n intelectgame --timeout=60s || echo "⚠️  Timeout lors de l'attente du pod"
echo "✅ Pod redémarré"
echo ""

# 5. Vérifier les logs pour voir si les erreurs persistent
echo "=== 5. Vérification des logs ==="
sleep 5
ERRORS=$(kubectl logs deployment/nginx-proxy -n intelectgame --tail=20 2>&1 | grep -i "could not be resolved\|Host not found" || echo "")
if [ -z "$ERRORS" ]; then
    echo "✅ Aucune erreur de résolution DNS dans les logs récents"
else
    echo "⚠️  Erreurs de résolution DNS détectées:"
    echo "$ERRORS"
fi
echo ""

# 6. Test final
echo "=== 6. Test final ==="
MINIKUBE_IP=$(minikube ip)
echo "Test via: http://$MINIKUBE_IP:30081"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://$MINIKUBE_IP:30081" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✅ Service accessible! Code HTTP: $HTTP_CODE"
elif [ "$HTTP_CODE" = "502" ]; then
    echo "⚠️  Code HTTP: 502 (Bad Gateway)"
    echo "   Le resolver DNS est peut-être corrigé, mais il y a encore un problème de connectivité"
    echo "   Vérifiez les logs: kubectl logs -f deployment/nginx-proxy -n intelectgame"
else
    echo "⚠️  Code HTTP: $HTTP_CODE"
    echo "   Vérifiez les logs: kubectl logs -f deployment/nginx-proxy -n intelectgame"
fi
echo ""

echo "✅ Correction terminée!"
echo ""
echo "📝 Résumé:"
echo "   Resolver DNS: $RESOLVER_IP"
echo "   Test: curl http://$MINIKUBE_IP:30081"

