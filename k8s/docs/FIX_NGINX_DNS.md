# 🔧 Résoudre les erreurs DNS dans Nginx

Guide pour résoudre les erreurs `could not be resolved` dans Nginx.

## 🔍 Problème

Les erreurs suivantes apparaissent dans les logs Nginx :
```
game-service could not be resolved (2: Server failure)
quiz-service could not be resolved (2: Server failure)
auth-service could not be resolved (2: Server failure)
```

## ✅ Solution

Nginx doit utiliser le **nom complet** des services Kubernetes pour la résolution DNS, pas le nom court.

### Nom court (ne fonctionne pas)
```nginx
set $game "game-service:3003";
```

### Nom complet (fonctionne)
```nginx
set $game "game-service.intelectgame.svc.cluster.local:3003";
```

## 🔧 Application de la correction

```bash
# Appliquer la configuration corrigée
./k8s/scripts/apply-nginx-dns-fix.sh
```

Ou manuellement :

```bash
# 1. Appliquer la configuration
kubectl apply -f k8s/nginx-proxy-config.yaml

# 2. Redémarrer Nginx
kubectl rollout restart deployment/nginx-proxy -n intelectgame

# 3. Vérifier
kubectl rollout status deployment/nginx-proxy -n intelectgame
```

## 📋 Noms complets des services

Dans Kubernetes, les services doivent être référencés avec leur nom complet :
- Format : `<service-name>.<namespace>.svc.cluster.local:<port>`
- Exemple : `game-service.intelectgame.svc.cluster.local:3003`

### Services de l'application

- **Auth Service** : `auth-service.intelectgame.svc.cluster.local:3001`
- **Quiz Service** : `quiz-service.intelectgame.svc.cluster.local:3002`
- **Game Service** : `game-service.intelectgame.svc.cluster.local:3003`
- **Frontend** : `frontend.intelectgame.svc.cluster.local:80`

## 🔍 Vérification

### 1. Vérifier que les services existent

```bash
kubectl get services -n intelectgame
```

### 2. Tester la résolution DNS depuis un pod

```bash
# Depuis un pod Nginx
kubectl exec -n intelectgame <nginx-pod> -- nslookup game-service.intelectgame.svc.cluster.local

# Ou avec getent
kubectl exec -n intelectgame <nginx-pod> -- getent hosts game-service.intelectgame.svc.cluster.local
```

### 3. Vérifier les logs Nginx

```bash
kubectl logs -f -l app=nginx-proxy -n intelectgame
```

Les erreurs `could not be resolved` ne devraient plus apparaître.

## 🐛 Problèmes courants

### Problème 1 : Resolver DNS incorrect

Si le resolver DNS dans Nginx est incorrect :

```nginx
resolver 10.96.0.10 valid=10s;
```

Vérifier l'adresse IP de CoreDNS :

```bash
kubectl get service kube-dns -n kube-system
# ou
kubectl get service coredns -n kube-system
```

### Problème 2 : Namespace incorrect

Vérifier que le namespace dans la configuration correspond au namespace réel :

```bash
kubectl get namespace intelectgame
```

### Problème 3 : Service n'existe pas

Vérifier que le service existe :

```bash
kubectl get service game-service -n intelectgame
```

## 📝 Configuration Nginx correcte

```nginx
http {
    # Resolver DNS pour Kubernetes
    resolver 10.96.0.10 valid=10s;
    
    server {
        # Game Service
        location /api/game {
            # Nom complet du service
            set $game "game-service.intelectgame.svc.cluster.local:3003";
            proxy_pass http://$game;
            # ...
        }
        
        # Quiz Service
        location /api/quiz {
            set $quiz "quiz-service.intelectgame.svc.cluster.local:3002";
            proxy_pass http://$quiz;
            # ...
        }
        
        # Auth Service
        location /api/auth {
            set $auth "auth-service.intelectgame.svc.cluster.local:3001";
            proxy_pass http://$auth;
            # ...
        }
    }
}
```

## 🆘 Si le problème persiste

1. **Vérifier CoreDNS** :
   ```bash
   kubectl get pods -n kube-system -l k8s-app=kube-dns
   kubectl logs -n kube-system -l k8s-app=kube-dns
   ```

2. **Vérifier la connectivité réseau** :
   ```bash
   kubectl exec -n intelectgame <nginx-pod> -- ping -c 3 game-service.intelectgame.svc.cluster.local
   ```

3. **Vérifier les endpoints** :
   ```bash
   kubectl get endpoints game-service -n intelectgame
   ```

## 📚 Ressources

- [Kubernetes DNS](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)
- [Nginx Resolver](http://nginx.org/en/docs/http/ngx_http_core_module.html#resolver)
- `k8s/nginx-proxy-config.yaml` - Configuration Nginx

