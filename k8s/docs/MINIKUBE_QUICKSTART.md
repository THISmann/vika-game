# Guide Rapide - Déploiement sur Minikube

## 🚀 Démarrage rapide

### 1. Démarrer Minikube

```bash
minikube start
```

### 2. Déployer l'application

**Option A : Script automatique (recommandé)**
```bash
chmod +x k8s/deploy.sh
./k8s/deploy.sh
```

**Option B : Déploiement manuel**
```bash
# Créer le namespace
kubectl create namespace intelectgame

# Créer le secret Telegram Bot (remplacez YOUR_TOKEN par votre token réel)
kubectl create secret generic telegram-bot-secret \
  --from-literal=TELEGRAM_BOT_TOKEN="YOUR_TOKEN" \
  -n intelectgame

# Déployer tous les services
kubectl apply -f k8s/all-services.yaml

# Vérifier le statut
kubectl get pods -n intelectgame
```

### 3. Accéder à l'application

```bash
# Obtenir l'URL du frontend
minikube service frontend -n intelectgame

# Ou directement via l'IP
echo "http://$(minikube ip):30080"
```

## 📋 Services déployés

| Service | Port Interne | Port Externe | Image DockerHub |
|---------|-------------|--------------|-----------------|
| Frontend | 5173 | 30080 (NodePort) | `thismann17/gamev2-frontend:latest` |
| Auth Service | 3001 | - | `thismann17/gamev2-auth-service:latest` |
| Quiz Service | 3002 | - | `thismann17/gamev2-quiz-service:latest` |
| Game Service | 3003 | - | `thismann17/gamev2-game-service:latest` |
| Telegram Bot | 3004 | - | `thismann17/gamev2-telegram-bot:latest` |
| MongoDB | 27017 | - | `mongo:7.0` |

## 🔧 Commandes utiles

### Voir les logs
```bash
# Logs d'un service
kubectl logs -f deployment/auth-service -n intelectgame
kubectl logs -f deployment/telegram-bot -n intelectgame

# Logs de tous les pods
kubectl logs -f -l app=auth-service -n intelectgame
```

### Redémarrer un service
```bash
kubectl rollout restart deployment/auth-service -n intelectgame
```

### Voir le statut
```bash
# Tous les pods
kubectl get pods -n intelectgame

# Tous les services
kubectl get services -n intelectgame

# Détails d'un pod
kubectl describe pod <pod-name> -n intelectgame
```

### Port forwarding (accès local)
```bash
# Auth service
kubectl port-forward service/auth-service 3001:3001 -n intelectgame

# Game service
kubectl port-forward service/game-service 3003:3003 -n intelectgame
```

## 🔐 Configuration du Token Telegram

### Créer le secret
```bash
kubectl create secret generic telegram-bot-secret \
  --from-literal=TELEGRAM_BOT_TOKEN="votre_token_ici" \
  -n intelectgame
```

### Mettre à jour le secret
```bash
kubectl delete secret telegram-bot-secret -n intelectgame
kubectl create secret generic telegram-bot-secret \
  --from-literal=TELEGRAM_BOT_TOKEN="nouveau_token" \
  -n intelectgame
kubectl rollout restart deployment/telegram-bot -n intelectgame
```

## 🗑️ Suppression

### Supprimer tous les services
```bash
kubectl delete -f k8s/all-services.yaml
```

### Supprimer le namespace entier
```bash
kubectl delete namespace intelectgame
```

## ⚠️ Dépannage

### Les pods ne démarrent pas
```bash
# Voir les événements
kubectl get events -n intelectgame --sort-by='.lastTimestamp'

# Décrire un pod
kubectl describe pod <pod-name> -n intelectgame

# Voir les logs
kubectl logs <pod-name> -n intelectgame
```

### Les images ne se téléchargent pas
Vérifiez que Minikube peut accéder à DockerHub :
```bash
# Tester la connexion
minikube ssh
docker pull thismann17/gamev2-auth-service:latest
exit
```

### Le frontend n'est pas accessible
```bash
# Vérifier le service
kubectl get service frontend -n intelectgame

# Vérifier l'IP de Minikube
minikube ip

# Accéder via minikube service
minikube service frontend -n intelectgame
```

## 📝 Notes

- Toutes les images sont tirées de DockerHub (`thismann17/gamev2-*`)
- Le frontend est accessible via NodePort 30080
- Les services backend communiquent via ClusterIP
- MongoDB utilise un volume emptyDir (données perdues au redémarrage du pod)
- Le token Telegram doit être configuré dans le secret Kubernetes

