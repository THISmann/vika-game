#!/bin/bash

# Script pour tester et corriger la configuration Nginx
# Usage: ./k8s/test-and-fix-nginx.sh

set -e

echo "🔍 Test et correction de la configuration Nginx..."
echo ""

# 1. Tester la résolution DNS depuis le pod Nginx
echo "=== 1. Test de résolution DNS ==="
echo "Test frontend..."
kubectl exec -n intelectgame deployment/nginx-proxy -- nslookup frontend.intelectgame.svc.cluster.local 2>&1 | head -10 || echo "❌ Échec"
echo ""

# 2. Tester la connectivité directe
echo "=== 2. Test de connectivité directe ==="
echo "Test frontend:80..."
FRONTEND_TEST=$(kubectl exec -n intelectgame deployment/nginx-proxy -- wget -qO- --timeout=3 http://frontend.intelectgame.svc.cluster.local:80 2>&1 | head -1 || echo "FAILED")
if [[ "$FRONTEND_TEST" == *"FAILED"* ]] || [[ -z "$FRONTEND_TEST" ]]; then
    echo "❌ Frontend non accessible via FQDN complet"
    echo "Test avec nom court..."
    FRONTEND_TEST_SHORT=$(kubectl exec -n intelectgame deployment/nginx-proxy -- wget -qO- --timeout=3 http://frontend:80 2>&1 | head -1 || echo "FAILED")
    if [[ "$FRONTEND_TEST_SHORT" != *"FAILED"* ]] && [[ -n "$FRONTEND_TEST_SHORT" ]]; then
        echo "✅ Frontend accessible via nom court!"
        USE_SHORT_NAMES=true
    else
        echo "❌ Frontend non accessible même avec nom court"
        USE_SHORT_NAMES=false
    fi
else
    echo "✅ Frontend accessible via FQDN complet"
    USE_SHORT_NAMES=false
fi
echo ""

# 3. Détecter l'adresse IP du service DNS
echo "=== 3. Détection du service DNS ==="
DNS_IP=$(kubectl get svc -n kube-system -o jsonpath='{.items[?(@.metadata.name=="kube-dns")].spec.clusterIP}' 2>/dev/null || \
         kubectl get svc -n kube-system -o jsonpath='{.items[?(@.metadata.name=="coredns")].spec.clusterIP}' 2>/dev/null || \
         echo "")
if [ -z "$DNS_IP" ]; then
    DNS_IP=$(kubectl get svc -n kube-system | grep -E 'kube-dns|coredns' | awk '{print $3}' | head -1)
fi
if [ -z "$DNS_IP" ]; then
    DNS_IP="10.96.0.10"
    echo "⚠️  Utilisation de l'adresse IP par défaut: $DNS_IP"
else
    echo "✅ Adresse IP du service DNS: $DNS_IP"
fi
echo ""

# 4. Mettre à jour la configuration
echo "=== 4. Mise à jour de la configuration ==="
if [ "$USE_SHORT_NAMES" = true ]; then
    echo "📝 Utilisation des noms courts dans la configuration..."
    # Créer une configuration avec noms courts
    cat > /tmp/nginx-config-update.yaml <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-proxy-config
  namespace: intelectgame
data:
  nginx.conf: |
    events {
        worker_connections 1024;
    }
    
    http {
        resolver $DNS_IP valid=10s;
        resolver_timeout 5s;
        
        server {
            listen 80;
            server_name _;
            
            set $frontend_upstream "frontend:80";
            set $auth_upstream "auth-service:3001";
            set $quiz_upstream "quiz-service:3002";
            set $game_upstream "game-service:3003";
            
            location / {
                proxy_pass http://\$frontend_upstream;
                proxy_set_header Host \$host;
                proxy_set_header X-Real-IP \$remote_addr;
                proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto \$scheme;
            }
            
            location /api/auth {
                rewrite ^/api/auth/(.*)\$ /auth/\$1 break;
                proxy_pass http://\$auth_upstream;
                proxy_set_header Host \$host;
                proxy_set_header X-Real-IP \$remote_addr;
                proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto \$scheme;
            }
            
            location /api/quiz {
                rewrite ^/api/quiz/(.*)\$ /quiz/\$1 break;
                proxy_pass http://\$quiz_upstream;
                proxy_set_header Host \$host;
                proxy_set_header X-Real-IP \$remote_addr;
                proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto \$scheme;
            }
            
            location /api/game {
                rewrite ^/api/game/(.*)\$ /game/\$1 break;
                proxy_pass http://\$game_upstream;
                proxy_set_header Host \$host;
                proxy_set_header X-Real-IP \$remote_addr;
                proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto \$scheme;
                proxy_http_version 1.1;
                proxy_set_header Upgrade \$http_upgrade;
                proxy_set_header Connection "upgrade";
            }
            
            location /socket.io {
                proxy_pass http://\$game_upstream;
                proxy_http_version 1.1;
                proxy_set_header Upgrade \$http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_set_header Host \$host;
                proxy_set_header X-Real-IP \$remote_addr;
                proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_read_timeout 86400;
            }
        }
    }
EOF
    kubectl apply -f /tmp/nginx-config-update.yaml
    echo "✅ Configuration mise à jour avec noms courts"
else
    echo "📝 Mise à jour du resolver DNS dans la configuration..."
    kubectl get configmap nginx-proxy-config -n intelectgame -o yaml | \
        sed "s/resolver [0-9.]*;/resolver $DNS_IP;/" | \
        kubectl apply -f -
    echo "✅ Resolver DNS mis à jour"
fi
echo ""

# 5. Redémarrer le pod
echo "=== 5. Redémarrage du pod Nginx ==="
kubectl rollout restart deployment/nginx-proxy -n intelectgame
echo "⏳ Attente du redémarrage..."
sleep 10
kubectl wait --for=condition=ready pod -l app=nginx-proxy -n intelectgame --timeout=60s
echo "✅ Pod redémarré"
echo ""

# 6. Test final
echo "=== 6. Test final ==="
MINIKUBE_IP=$(minikube ip)
echo "Test via: http://$MINIKUBE_IP:30081"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://$MINIKUBE_IP:30081" || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✅ Service accessible! Code HTTP: $HTTP_CODE"
else
    echo "⚠️  Code HTTP: $HTTP_CODE (peut être normal si le frontend n'est pas encore prêt)"
    echo "Vérifiez les logs: kubectl logs -f deployment/nginx-proxy -n intelectgame"
fi
echo ""

echo "✅ Correction terminée!"

