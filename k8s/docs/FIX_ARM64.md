# Solution pour le problème ARM64/AMD64

## Problème

Les images DockerHub sont construites pour `linux/amd64`, mais Minikube sur Mac M1/M2 utilise `linux/arm64`, ce qui cause des erreurs `ErrImagePull`.

## Solutions

### Solution 1 : Utiliser Docker Desktop avec Kubernetes (Recommandé)

1. **Installer Docker Desktop** (si ce n'est pas déjà fait)
2. **Activer Kubernetes** dans Docker Desktop :
   - Ouvrir Docker Desktop
   - Aller dans Settings > Kubernetes
   - Cocher "Enable Kubernetes"
   - Cliquer sur "Apply & Restart"

3. **Utiliser le contexte Kubernetes de Docker Desktop** :
   ```bash
   kubectl config use-context docker-desktop
   ```

4. **Déployer l'application** :
   ```bash
   ./k8s/deploy.sh
   ```

### Solution 2 : Construire les images multi-architecture

Construire les images pour supporter à la fois ARM64 et AMD64 :

```bash
# Pour chaque service
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 \
  -t thismann17/gamev2-auth-service:latest \
  --push ./node/auth-service
```

### Solution 3 : Utiliser des images locales (Développement)

Construire les images localement et les charger dans Minikube :

```bash
# Activer le Docker daemon de Minikube
eval $(minikube docker-env)

# Construire les images localement
docker build -t thismann17/gamev2-auth-service:latest ./node/auth-service
docker build -t thismann17/gamev2-quiz-service:latest ./node/quiz-service
docker build -t thismann17/gamev2-game-service:latest ./node/game-service
docker build -t thismann17/gamev2-telegram-bot:latest ./node/telegram-bot
docker build -t thismann17/gamev2-frontend:latest ./vue

# Modifier les deployments pour utiliser imagePullPolicy: Never
# Puis redéployer
kubectl apply -f k8s/all-services.yaml
```

### Solution 4 : Utiliser Colima (Alternative à Minikube)

Colima supporte mieux les architectures multiples :

```bash
# Installer Colima
brew install colima

# Démarrer Colima avec amd64
colima start --arch x86_64

# Utiliser le contexte Docker
eval $(colima docker-env)

# Construire et déployer
```

## Vérification

Pour vérifier l'architecture de votre cluster :

```bash
kubectl get nodes -o wide
```

Pour vérifier l'architecture des images :

```bash
docker manifest inspect thismann17/gamev2-auth-service:latest
```

## Solution rapide pour le développement

Si vous voulez juste tester rapidement, utilisez la Solution 3 avec des images locales :

1. Modifiez temporairement `k8s/all-services.yaml` pour utiliser `imagePullPolicy: Never`
2. Construisez les images localement avec le daemon Docker de Minikube
3. Déployez

