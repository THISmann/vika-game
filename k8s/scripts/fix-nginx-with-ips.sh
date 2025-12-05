#!/bin/bash

# Script pour corriger Nginx en utilisant les adresses IP des services directement
# Usage: ./k8s/fix-nginx-with-ips.sh

set -e

echo "🔧 Correction de Nginx en utilisant les adresses IP des services..."
echo ""

# 1. Obtenir les adresses IP des services (ClusterIP - stables)
echo "=== 1. Récupération des adresses IP des services ==="

FRONTEND_IP=$(kubectl get svc frontend -n intelectgame -o jsonpath='{.spec.clusterIP}' 2>/dev/null)
AUTH_IP=$(kubectl get svc auth-service -n intelectgame -o jsonpath='{.spec.clusterIP}' 2>/dev/null)
QUIZ_IP=$(kubectl get svc quiz-service -n intelectgame -o jsonpath='{.spec.clusterIP}' 2>/dev/null)
GAME_IP=$(kubectl get svc game-service -n intelectgame -o jsonpath='{.spec.clusterIP}' 2>/dev/null)

if [ -z "$FRONTEND_IP" ] || [ -z "$AUTH_IP" ] || [ -z "$QUIZ_IP" ] || [ -z "$GAME_IP" ]; then
    echo "❌ Impossible d'obtenir toutes les adresses IP des services"
    echo "Frontend: ${FRONTEND_IP:-NON TROUVÉ}"
    echo "Auth: ${AUTH_IP:-NON TROUVÉ}"
    echo "Quiz: ${QUIZ_IP:-NON TROUVÉ}"
    echo "Game: ${GAME_IP:-NON TROUVÉ}"
    exit 1
fi

echo "✅ Adresses IP récupérées:"
echo "   Frontend: $FRONTEND_IP"
echo "   Auth Service: $AUTH_IP"
echo "   Quiz Service: $QUIZ_IP"
echo "   Game Service: $GAME_IP"
echo ""

# 2. Créer la configuration Nginx avec les adresses IP
echo "=== 2. Création de la configuration Nginx ==="

cat > /tmp/nginx-config-ip.yaml <<EOF
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
            
            # Frontend (utilise l'adresse IP directement)
            location / {
                proxy_pass http://${FRONTEND_IP}:80;
                proxy_set_header Host \$host;
                proxy_set_header X-Real-IP \$remote_addr;
                proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto \$scheme;
            }
            
            # Auth Service
            location /api/auth {
                rewrite ^/api/auth/(.*)\$ /auth/\$1 break;
                proxy_pass http://${AUTH_IP}:3001;
                proxy_set_header Host \$host;
                proxy_set_header X-Real-IP \$remote_addr;
                proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto \$scheme;
            }
            
            # Quiz Service
            location /api/quiz {
                rewrite ^/api/quiz/(.*)\$ /quiz/\$1 break;
                proxy_pass http://${QUIZ_IP}:3002;
                proxy_set_header Host \$host;
                proxy_set_header X-Real-IP \$remote_addr;
                proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto \$scheme;
            }
            
            # Game Service (HTTP)
            location /api/game {
                rewrite ^/api/game/(.*)\$ /game/\$1 break;
                proxy_pass http://${GAME_IP}:3003;
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
                proxy_pass http://${GAME_IP}:3003;
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

kubectl apply -f /tmp/nginx-config-ip.yaml
echo "✅ Configuration mise à jour avec les adresses IP"
echo ""

# 3. Redémarrer le pod Nginx
echo "=== 3. Redémarrage du pod Nginx ==="
kubectl rollout restart deployment/nginx-proxy -n intelectgame
echo "⏳ Attente du redémarrage..."
sleep 10

# Attendre que le pod soit prêt
kubectl wait --for=condition=ready pod -l app=nginx-proxy -n intelectgame --timeout=60s || echo "⚠️  Timeout lors de l'attente du pod"
echo "✅ Pod redémarré"
echo ""

# 4. Test final
echo "=== 4. Test final ==="
MINIKUBE_IP=$(minikube ip)
echo "Test via: http://$MINIKUBE_IP:30081"
sleep 5

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://$MINIKUBE_IP:30081" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✅ Service accessible! Code HTTP: $HTTP_CODE"
    echo ""
    echo "🎉 Succès! L'application est maintenant accessible!"
elif [ "$HTTP_CODE" = "502" ]; then
    echo "⚠️  Code HTTP: 502 (Bad Gateway)"
    echo "   Vérifiez les logs: kubectl logs -f deployment/nginx-proxy -n intelectgame"
    echo "   Vérifiez que les pods backend sont en état Running"
else
    echo "⚠️  Code HTTP: $HTTP_CODE"
    echo "   Vérifiez les logs: kubectl logs -f deployment/nginx-proxy -n intelectgame"
fi
echo ""

echo "✅ Correction terminée!"
echo ""
echo "📝 Note: Les adresses IP utilisées sont les ClusterIP des services,"
echo "   elles sont stables et ne changeront pas sauf si vous supprimez/recréez les services"

