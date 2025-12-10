# Fix: Problème de connexion Docker Hub

## Problème

Docker ne peut pas se connecter à Docker Hub pour télécharger les images à cause d'un proxy mal configuré.

```
failed to resolve source metadata for docker.io/library/node:20-alpine: 
failed to do request: Head "https://registry-1.docker.io/v2/library/node/manifests/20-alpine": 
dialing registry-1.docker.io:443 container via direct connection because disabled has no HTTPS proxy: 
connecting to registry-1.docker.io:443: dial tcp: lookup registry-1.docker.io: no such host
```

## Solutions

### Solution 1 : Désactiver le proxy Docker (Recommandé)

1. **Vérifier la configuration Docker** :
   ```bash
   docker info | grep -i proxy
   ```

2. **Désactiver le proxy** :
   - Sur macOS : Docker Desktop > Settings > Resources > Proxies
   - Désactiver "Manual proxy configuration" ou "System proxy"
   - Ou modifier `~/.docker/config.json` :
     ```json
     {
       "proxies": {
         "default": {
           "httpProxy": "",
           "httpsProxy": "",
           "noProxy": ""
         }
       }
     }
     ```

3. **Redémarrer Docker Desktop**

### Solution 2 : Utiliser une image locale

Si vous avez déjà une image Node.js locale, modifiez les Dockerfiles :

**Pour `vue/Dockerfile`** :
```dockerfile
FROM node:18-alpine AS build
# ... reste du fichier
```

**Pour les autres services**, vérifiez quelle version de Node.js est disponible :
```bash
docker images | grep node
```

### Solution 3 : Télécharger l'image manuellement

1. **Sur une machine avec Internet** :
   ```bash
   docker pull node:20-alpine
   docker save node:20-alpine -o node-20-alpine.tar
   ```

2. **Transférer le fichier** et charger :
   ```bash
   docker load -i node-20-alpine.tar
   ```

### Solution 4 : Utiliser un mirror Docker Hub

Si vous avez accès à un mirror Docker Hub, configurez-le dans `/etc/docker/daemon.json` :
```json
{
  "registry-mirrors": ["https://your-mirror-url"]
}
```

### Solution 5 : Build sans pull (si l'image existe localement)

```bash
docker build --pull=false -t frontend ./vue
```

## Vérification

Après avoir appliqué une solution, testez :
```bash
docker pull node:20-alpine
```

Si cela fonctionne, vous pouvez builder :
```bash
docker-compose build frontend
```

## Note

Le proxy `http.docker.internal:3128` semble être une configuration Docker Desktop qui n'est plus accessible. Il est recommandé de le désactiver si vous n'en avez pas besoin.

