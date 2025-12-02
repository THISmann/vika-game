# Déploiement Kubernetes sur Minikube

Ce guide explique comment déployer l'application IntelectGame sur Minikube en utilisant les images DockerHub.

## Prérequis

- Minikube installé et démarré
- kubectl configuré pour Minikube
- Les images DockerHub disponibles :
  - `thismann17/gamev2-auth-service:latest`
  - `thismann17/gamev2-quiz-service:latest`
  - `thismann17/gamev2-game-service:latest`
  - `thismann17/gamev2-telegram-bot:latest`
  - `thismann17/gamev2-frontend:latest`

## Démarrage rapide

### Option 1 : Script automatique

```bash
chmod +x k8s/deploy.sh
./k8s/deploy.sh
```

### Option 2 : Déploiement manuel

1. **Démarrer Minikube** (si ce n'est pas déjà fait) :
   ```bash
   minikube start
   ```

2. **Créer le secret pour le token Telegram Bot** :
   ```bash
   kubectl create namespace intelectgame
   kubectl create secret generic telegram-bot-secret \
     --from-literal=TELEGRAM_BOT_TOKEN="votre_token_ici" \
     -n intelectgame
   ```

   Ou éditez `k8s/all-services.yaml` et remplacez `YOUR_TELEGRAM_BOT_TOKEN_HERE` par votre token réel.

3. **Déployer tous les services** :
   ```bash
   kubectl apply -f k8s/all-services.yaml
   ```

4. **Vérifier le statut** :
   ```bash
   kubectl get pods -n intelectgame
   kubectl get services -n intelectgame
   ```

5. **Accéder à l'application** :
   ```bash
   minikube service frontend -n intelectgame
   ```
   
   Ou directement via l'IP de Minikube :
   ```bash
   echo "http://$(minikube ip):30080"
   ```

## Services déployés

### Backend Services
- **auth-service** : Port 3001 (ClusterIP)
- **quiz-service** : Port 3002 (ClusterIP)
- **game-service** : Port 3003 (ClusterIP)
- **telegram-bot** : Port 3004 (ClusterIP)

### Frontend
- **frontend** : Port 80 (NodePort 30080) - Accessible depuis l'extérieur

### Base de données
- **mongodb** : Port 27017 (ClusterIP)

## Configuration

### Variables d'environnement

Les services sont configurés via :
- **ConfigMap** (`app-config`) : Configuration générale
- **Secret** (`telegram-bot-secret`) : Token Telegram Bot

### Modifier la configuration

1. **Modifier le ConfigMap** :
   ```bash
   kubectl edit configmap app-config -n intelectgame
   ```

2. **Modifier le Secret Telegram** :
   ```bash
   kubectl edit secret telegram-bot-secret -n intelectgame
   ```

3. **Redémarrer les pods** :
   ```bash
   kubectl rollout restart deployment -n intelectgame
   ```

## Commandes utiles

### Voir les logs
```bash
# Logs d'un service spécifique
kubectl logs -f deployment/auth-service -n intelectgame
kubectl logs -f deployment/telegram-bot -n intelectgame

# Logs de tous les pods
kubectl logs -f -l app=auth-service -n intelectgame
```

### Redémarrer un service
```bash
kubectl rollout restart deployment/auth-service -n intelectgame
```

### Mettre à l'échelle
```bash
# Augmenter le nombre de répliques
kubectl scale deployment auth-service --replicas=3 -n intelectgame
```

### Accéder à un pod
```bash
kubectl exec -it <pod-name> -n intelectgame -- sh
```

### Port forwarding (pour accéder à un service depuis la machine locale)
```bash
# Auth service
kubectl port-forward service/auth-service 3001:3001 -n intelectgame

# Game service
kubectl port-forward service/game-service 3003:3003 -n intelectgame
```

## Dépannage

### Les pods ne démarrent pas

1. Vérifier les événements :
   ```bash
   kubectl describe pod <pod-name> -n intelectgame
   ```

2. Vérifier les logs :
   ```bash
   kubectl logs <pod-name> -n intelectgame
   ```

3. Vérifier que les images sont disponibles :
   ```bash
   kubectl get events -n intelectgame --sort-by='.lastTimestamp'
   ```

### Les images ne se téléchargent pas

Si Minikube ne peut pas accéder à DockerHub, configurez le registry :

```bash
# Activer le registry dans Minikube
minikube addons enable registry

# Ou configurer un proxy DockerHub si nécessaire
```

### Le frontend n'est pas accessible

1. Vérifier que le service NodePort est actif :
   ```bash
   kubectl get service frontend -n intelectgame
   ```

2. Vérifier l'IP de Minikube :
   ```bash
   minikube ip
   ```

3. Accéder via le service Minikube :
   ```bash
   minikube service frontend -n intelectgame
   ```

## Suppression

Pour supprimer tous les déploiements :

```bash
kubectl delete -f k8s/all-services.yaml
```

Ou supprimer le namespace entier :

```bash
kubectl delete namespace intelectgame
```

## Images DockerHub utilisées

Toutes les images sont tirées de DockerHub :
- `thismann17/gamev2-auth-service:latest`
- `thismann17/gamev2-quiz-service:latest`
- `thismann17/gamev2-game-service:latest`
- `thismann17/gamev2-telegram-bot:latest`
- `thismann17/gamev2-frontend:latest`

Les images sont configurées avec `imagePullPolicy: Always` pour toujours utiliser la dernière version.
