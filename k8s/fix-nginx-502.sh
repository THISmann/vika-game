#!/bin/bash

# Script pour diagnostiquer et corriger l'erreur 502 Bad Gateway
# Usage: ./k8s/fix-nginx-502.sh

set -e

echo "🔍 Diagnostic de l'erreur 502 Bad Gateway..."
echo ""

# 1. Vérifier les logs Nginx
echo "=== 1. Logs Nginx (erreurs récentes) ==="
kubectl logs deployment/nginx-proxy -n intelectgame --tail=20 | grep -i error || echo "Aucune erreur dans les logs récents"
echo ""

# 2. Vérifier que les services backend existent
echo "=== 2. Services backend ==="
kubectl get svc -n intelectgame | grep -E 'frontend|auth-service|quiz-service|game-service'
echo ""

# 3. Vérifier que les pods backend sont Running
echo "=== 3. Pods backend ==="
kubectl get pods -n intelectgame | grep -E 'frontend|auth-service|quiz-service|game-service'
echo ""

# 4. Tester la résolution DNS depuis le pod Nginx
echo "=== 4. Test de résolution DNS depuis Nginx ==="
kubectl exec -n intelectgame deployment/nginx-proxy -- nslookup frontend.intelectgame.svc.cluster.local || echo "❌ Échec de résolution DNS pour frontend"
kubectl exec -n intelectgame deployment/nginx-proxy -- nslookup auth-service.intelectgame.svc.cluster.local || echo "❌ Échec de résolution DNS pour auth-service"
echo ""

# 5. Tester la connectivité depuis le pod Nginx
echo "=== 5. Test de connectivité depuis Nginx ==="
echo "Test frontend:80..."
kubectl exec -n intelectgame deployment/nginx-proxy -- wget -qO- --timeout=3 http://frontend.intelectgame.svc.cluster.local:80 2>&1 | head -3 || echo "❌ Frontend non accessible"
echo ""
echo "Test auth-service:3001..."
kubectl exec -n intelectgame deployment/nginx-proxy -- wget -qO- --timeout=3 http://auth-service.intelectgame.svc.cluster.local:3001 2>&1 | head -3 || echo "❌ Auth-service non accessible"
echo ""

# 6. Vérifier la configuration Nginx
echo "=== 6. Configuration Nginx actuelle ==="
kubectl exec -n intelectgame deployment/nginx-proxy -- cat /etc/nginx/nginx.conf | grep -A 5 "resolver\|frontend_upstream\|auth_upstream" || echo "Configuration non trouvée"
echo ""

# 7. Vérifier le resolver DNS
echo "=== 7. Test du resolver DNS ==="
DNS_IP=$(kubectl get svc -n kube-system -o jsonpath='{.items[?(@.metadata.name=="kube-dns")].spec.clusterIP}' 2>/dev/null || \
         kubectl get svc -n kube-system -o jsonpath='{.items[?(@.metadata.name=="coredns")].spec.clusterIP}' 2>/dev/null || \
         echo "10.96.0.10")
echo "Adresse IP du service DNS: $DNS_IP"
kubectl exec -n intelectgame deployment/nginx-proxy -- nslookup -type=A frontend.intelectgame.svc.cluster.local $DNS_IP || echo "❌ Résolution DNS échouée"
echo ""

# 8. Suggestions de correction
echo "=== 8. Suggestions ==="
echo ""
echo "Si la résolution DNS échoue, vérifiez:"
echo "  1. Que le service DNS de Kubernetes fonctionne:"
echo "     kubectl get pods -n kube-system | grep -E 'kube-dns|coredns'"
echo ""
echo "  2. Que les services backend sont dans le même namespace:"
echo "     kubectl get svc -n intelectgame"
echo ""
echo "  3. Mettre à jour le resolver DNS dans la configuration Nginx:"
echo "     kubectl get configmap nginx-proxy-config -n intelectgame -o yaml"
echo ""

