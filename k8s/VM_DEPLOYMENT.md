# Déploiement sur VM cloud.ru

Guide complet pour déployer l'application IntelectGame sur une VM cloud.ru avec Minikube.

## Prérequis

- Minikube installé et démarré sur la VM
- Code de l'application présent sur la VM
- Accès root/sudo pour le firewall (si nécessaire)

## Déploiement rapide

### 1. Déploiement initial

```bash
# Déploiement avec construction des images
./k8s/deploy-vm.sh --rebuild

# Ou avec le token Telegram directement
./k8s/deploy-vm.sh --rebuild --token "votre_token_telegram"
```

### 2. Vérifier le statut

```bash
./k8s/status.sh
```

### 3. Exposer publiquement

**Option A : Via NodePort (simple)**
```bash
./k8s/expose-public.sh
```

**Option B : Via minikube tunnel (recommandé)**
```bash
./k8s/deploy-vm-minikube-tunnel.sh
```

## Scripts disponibles

### `deploy-vm.sh`
Script principal de déploiement.

**Options :**
- `--rebuild` : Reconstruire toutes les images Docker
- `--token TELEGRAM_TOKEN` : Définir le token Telegram directement

**Exemples :**
```bash
# Déploiement initial avec construction
./k8s/deploy-vm.sh --rebuild

# Mise à jour du token Telegram
./k8s/deploy-vm.sh --token "nouveau_token"

# Redéploiement sans reconstruction
./k8s/deploy-vm.sh
```

### `status.sh`
Affiche le statut complet de l'application :
- État des pods
- Services
- ConfigMaps et Secrets
- URLs d'accès

```bash
./k8s/status.sh
```

### `expose-public.sh`
Configure l'exposition publique de l'application :
- Ouvre le port dans le firewall
- Affiche les URLs d'accès
- Génère une configuration nginx (si nécessaire)

```bash
./k8s/expose-public.sh
```

### `deploy-vm-minikube-tunnel.sh`
Expose l'application via minikube tunnel (LoadBalancer).

```bash
./k8s/deploy-vm-minikube-tunnel.sh
```

### `undeploy.sh`
Supprime complètement le déploiement.

```bash
./k8s/undeploy.sh
```

## Configuration du firewall

Le script `expose-public.sh` configure automatiquement :
- **ufw** (Ubuntu/Debian)
- **firewalld** (CentOS/RHEL)

Si vous utilisez un autre firewall, ouvrez manuellement le port NodePort (généralement 30080).

## Exposition via Nginx (Recommandé pour production)

### 1. Installer Nginx

```bash
sudo apt update
sudo apt install nginx
```

### 2. Créer la configuration

```bash
sudo nano /etc/nginx/sites-available/intelectgame
```

Contenu :
```nginx
server {
    listen 80;
    server_name votre-domaine.com;  # Remplacez par votre domaine ou IP

    location / {
        proxy_pass http://$(minikube ip):30080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Activer la configuration

```bash
sudo ln -s /etc/nginx/sites-available/intelectgame /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Configurer SSL (optionnel avec Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

## Mise à jour de l'application

### Mettre à jour le code

```bash
# Sur la VM, mettre à jour le code
git pull origin main  # ou votre branche

# Reconstruire et redéployer
./k8s/deploy-vm.sh --rebuild
```

### Mettre à jour un service spécifique

```bash
# Reconstruire l'image
eval $(minikube docker-env)
docker build -t thismann17/gamev2-auth-service:latest ./node/auth-service

# Redémarrer le service
kubectl rollout restart deployment/auth-service -n intelectgame
```

## Commandes utiles

### Voir les logs

```bash
# Logs d'un service
kubectl logs -f deployment/auth-service -n intelectgame

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

## Dépannage

### Les pods ne démarrent pas

```bash
# Voir les événements
kubectl get events -n intelectgame --sort-by='.lastTimestamp'

# Décrire un pod
kubectl describe pod <pod-name> -n intelectgame

# Voir les logs
kubectl logs <pod-name> -n intelectgame
```

### L'application n'est pas accessible

1. Vérifier que le service frontend est actif :
   ```bash
   kubectl get service frontend -n intelectgame
   ```

2. Vérifier que le port est ouvert :
   ```bash
   sudo netstat -tlnp | grep 30080
   ```

3. Vérifier le firewall :
   ```bash
   sudo ufw status
   # ou
   sudo firewall-cmd --list-ports
   ```

### Minikube ne démarre pas

```bash
# Vérifier le statut
minikube status

# Redémarrer
minikube stop
minikube start --driver=docker
```

## Maintenance

### Sauvegarder les données

Les données sont stockées dans des volumes emptyDir (temporaires). Pour persister :

1. Créer des PersistentVolumes
2. Modifier les deployments pour utiliser ces volumes

### Mettre à jour Minikube

```bash
minikube update-check
minikube upgrade
```

## Support

Pour plus d'aide :
- Consultez les logs : `kubectl logs -f <pod-name> -n intelectgame`
- Vérifiez le statut : `./k8s/status.sh`
- Consultez la documentation Kubernetes : https://kubernetes.io/docs/

