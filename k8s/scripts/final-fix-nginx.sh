#!/bin/bash

# Script final pour corriger Nginx - utilise les ClusterIP des services
# Usage: ./k8s/final-fix-nginx.sh

set -e

echo "🔧 Correction finale de Nginx..."
echo ""

# 1. Vérifier que tous les services existent
echo "=== 1. Vérification des services ==="
SERVICES=("frontend" "auth-service" "quiz-service" "game-service")
for service in "${SERVICES[@]}"; do
    if kubectl get svc $service -n intelectgame &> /dev/null; then
        echo "✅ Service $service existe"
    else
        echo "❌ Service $service n'existe pas!"
        exit 1
    fi
done
echo ""

# 2. Obtenir les ClusterIP des services
echo "=== 2. Récupération des ClusterIP ==="

FRONTEND_IP=$(kubectl get svc frontend -n intelectgame -o jsonpath='{.spec.clusterIP}')
FRONTEND_PORT=$(kubectl get svc frontend -n intelectgame -o jsonpath='{.spec.ports[0].port}')

AUTH_IP=$(kubectl get svc auth-service -n intelectgame -o jsonpath='{.spec.clusterIP}')
AUTH_PORT=$(kubectl get svc auth-service -n intelectgame -o jsonpath='{.spec.ports[0].port}')

QUIZ_IP=$(kubectl get svc quiz-service -n intelectgame -o jsonpath='{.spec.clusterIP}')
QUIZ_PORT=$(kubectl get svc quiz-service -n intelectgame -o jsonpath='{.spec.ports[0].port}')

GAME_IP=$(kubectl get svc game-service -n intelectgame -o jsonpath='{.spec.clusterIP}')
GAME_PORT=$(kubectl get svc game-service -n intelectgame -o jsonpath='{.spec.ports[0].port}')

echo "Frontend: $FRONTEND_IP:$FRONTEND_PORT"
echo "Auth Service: $AUTH_IP:$AUTH_PORT"
echo "Quiz Service: $QUIZ_IP:$QUIZ_PORT"
echo "Game Service: $GAME_IP:$GAME_PORT"
echo ""

# 3. Créer la configuration Nginx
echo "=== 3. Création de la configuration Nginx ==="

cat > /tmp/nginx-config-final.yaml <<EOF
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
        server {
            listen 80;
            server_name _;
            
            # Frontend
            location / {
                proxy_pass http://${FRONTEND_IP}:${FRONTEND_PORT};
                proxy_set_header Host \$host;
                proxy_set_header X-Real-IP \$remote_addr;
                proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto \$scheme;
            }
            
            # Auth Service
            location /api/auth {
                rewrite ^/api/auth/(.*)\$ /auth/\$1 break;
                proxy_pass http://${AUTH_IP}:${AUTH_PORT};
                proxy_set_header Host \$host;
                proxy_set_header X-Real-IP \$remote_addr;
                proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto \$scheme;
            }
            
            # Quiz Service
            location /api/quiz {
                rewrite ^/api/quiz/(.*)\$ /quiz/\$1 break;
                proxy_pass http://${QUIZ_IP}:${QUIZ_PORT};
                proxy_set_header Host \$host;
                proxy_set_header X-Real-IP \$remote_addr;
                proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto \$scheme;
            }
            
            # Game Service (HTTP)
            location /api/game {
                rewrite ^/api/game/(.*)\$ /game/\$1 break;
                proxy_pass http://${GAME_IP}:${GAME_PORT};
                proxy_set_header Host \$host;
                proxy_set_header X-Real-IP \$remote_addr;
                proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto \$scheme;
                
                # WebSocket support
                proxy_http_version 1.1;
                proxy_set_header Upgrade \$http_upgrade;
                proxy_set_header Connection "upgrade";
            }
            
            # Game Service WebSocket (Socket.IO)
            location /socket.io {
                proxy_pass http://${GAME_IP}:${GAME_PORT};
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

kubectl apply -f /tmp/nginx-config-final.yaml
echo "✅ Configuration créée"
echo ""

# 4. Redémarrer le pod
echo "=== 4. Redémarrage du pod Nginx ==="
kubectl rollout restart deployment/nginx-proxy -n intelectgame
echo "⏳ Attente du redémarrage..."
sleep 15

kubectl wait --for=condition=ready pod -l app=nginx-proxy -n intelectgame --timeout=60s || echo "⚠️  Timeout"
echo "✅ Pod redémarré"
echo ""

# 5. Vérifier les logs
echo "=== 5. Vérification des logs ==="
sleep 5
ERRORS=$(kubectl logs deployment/nginx-proxy -n intelectgame --tail=20 2>&1 | grep -i "error\|could not\|failed" || echo "")
if [ -z "$ERRORS" ]; then
    echo "✅ Aucune erreur dans les logs"
else
    echo "⚠️  Erreurs détectées:"
    echo "$ERRORS"
fi
echo ""

# 6. Test final
echo "=== 6. Test final ==="
MINIKUBE_IP=$(minikube ip)
echo "Test via: http://$MINIKUBE_IP:30081"
sleep 3

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "http://$MINIKUBE_IP:30081" 2>/dev/null || echo "000")

echo ""
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "🎉 SUCCÈS! Code HTTP: $HTTP_CODE"
    echo ""
    echo "✅ L'application est maintenant accessible!"
    echo "   http://$MINIKUBE_IP:30081"
    echo "   http://82.202.141.248:30081 (si minikube tunnel est actif)"
elif [ "$HTTP_CODE" = "502" ]; then
    echo "❌ Code HTTP: 502 (Bad Gateway)"
    echo ""
    echo "Le problème persiste. Vérifications supplémentaires:"
    echo "1. Vérifiez que les pods backend sont Running:"
    echo "   kubectl get pods -n intelectgame"
    echo ""
    echo "2. Testez la connectivité depuis le pod Nginx:"
    echo "   kubectl exec -n intelectgame deployment/nginx-proxy -- wget -qO- http://${FRONTEND_IP}:${FRONTEND_PORT}"
    echo ""
    echo "3. Vérifiez les logs:"
    echo "   kubectl logs -f deployment/nginx-proxy -n intelectgame"
else
    echo "⚠️  Code HTTP: $HTTP_CODE"
    echo "   Vérifiez les logs: kubectl logs -f deployment/nginx-proxy -n intelectgame"
fi
echo ""

echo "✅ Script terminé!"

