# Guide de résolution des problèmes Minikube

## Problème : Failing to connect to https://registry.k8s.io/

### Symptômes
```
❗  Failing to connect to https://registry.k8s.io/ from inside the minikube container
💡  To pull new external images, you may need to configure a proxy
```

### Causes
1. Problème de connexion Internet
2. Firewall/proxy bloquant l'accès au registry Kubernetes
3. Problème DNS
4. Restrictions géographiques

### Solutions

#### Solution 1 : Utiliser un registry alternatif (Recommandé)

Utilisez un registry mirror comme Aliyun (Chine) ou d'autres mirrors régionaux :

```bash
minikube start --driver=docker \
    --image-mirror-country=fr \
    --image-repository='registry.aliyuncs.com/google_containers' \
    --kubernetes-version=stable
```

**Avantages** : Évite complètement le registry.k8s.io

#### Solution 2 : Utiliser le script de démarrage automatique

```bash
./k8s/scripts/start-minikube.sh
```

Ce script essaie automatiquement plusieurs méthodes pour démarrer Minikube.

#### Solution 3 : Configurer un proxy

Si vous êtes derrière un proxy :

```bash
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
export NO_PROXY=localhost,127.0.0.1,10.96.0.0/12,192.168.99.0/24

minikube start --driver=docker --docker-env HTTP_PROXY=$HTTP_PROXY --docker-env HTTPS_PROXY=$HTTPS_PROXY
```

#### Solution 4 : Démarrer sans télécharger les images

```bash
minikube start --driver=docker --skip-image-download
```

Les images seront téléchargées au besoin lors du déploiement.

#### Solution 5 : Utiliser une version spécifique de Kubernetes

```bash
minikube start --driver=docker --kubernetes-version=v1.28.0
```

#### Solution 6 : Vérifier la connexion réseau

```bash
# Tester la connexion au registry
curl -I https://registry.k8s.io/

# Si cela échoue, tester avec un proxy
curl -I --proxy http://proxy:port https://registry.k8s.io/

# Vérifier DNS
nslookup registry.k8s.io
```

### Solutions permanentes

#### Créer un alias pour Minikube

Ajoutez à votre `~/.zshrc` ou `~/.bashrc` :

```bash
alias minikube-start='minikube start --driver=docker --image-mirror-country=fr --image-repository="registry.aliyuncs.com/google_containers"'
```

#### Configuration Minikube avec profil personnalisé

Créez un profil Minikube avec les bonnes options :

```bash
minikube profile set intelectgame
minikube config set driver docker
minikube config set image-repository registry.aliyuncs.com/google_containers
minikube config set image-mirror-country fr
minikube start --profile intelectgame
```

### Vérification

Après le démarrage, vérifiez que Minikube fonctionne :

```bash
# Vérifier le statut
minikube status

# Vérifier les nodes
kubectl get nodes

# Vérifier les pods système
kubectl get pods -n kube-system
```

### Solution rapide pour l'apiserver qui ne démarre pas

Si Minikube démarre mais l'apiserver ne fonctionne pas :

```bash
# Utiliser le script de correction automatique
./k8s/scripts/fix-minikube-apiserver.sh

# Ou manuellement :
minikube stop
minikube start --driver=docker --skip-image-download
```

### Si le problème persiste

1. **Réinitialiser Minikube** :
   ```bash
   minikube delete
   minikube start --driver=docker --skip-image-download
   ```

2. **Utiliser les images en cache** :
   ```bash
   minikube delete
   minikube start --driver=docker --skip-image-download --kubernetes-version=stable
   ```

2. **Utiliser Docker Desktop** :
   - Activez Kubernetes dans Docker Desktop
   - Utilisez `kubectl` avec le contexte Docker Desktop

3. **Utiliser Kind (Kubernetes in Docker)** :
   ```bash
   kind create cluster
   ```

4. **Vérifier les logs Minikube** :
   ```bash
   minikube logs
   ```

### Notes importantes

- Le message d'avertissement sur registry.k8s.io n'est **pas toujours critique**
- Minikube peut fonctionner même si cette connexion échoue
- Les images Kubernetes nécessaires peuvent être téléchargées localement
- Utiliser un registry mirror est la solution la plus fiable pour éviter ce problème

