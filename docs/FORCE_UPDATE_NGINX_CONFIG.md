# Forcer la mise à jour de la configuration Nginx

## Problème

La configuration Nginx dans le pod ne contient pas `proxy_set_header Authorization`, même si le fichier local est correct.

## Cause

La ConfigMap n'a pas été mise à jour ou le pod Nginx n'a pas été redémarré pour charger la nouvelle configuration.

## Solution

### Méthode 1 : Utiliser le script automatique (recommandé)

```bash
./k8s/scripts/force-apply-nginx-config.sh
```

Ce script :
1. Applique la configuration
2. Vérifie que la ConfigMap contient bien la configuration
3. Supprime le pod Nginx pour forcer le rechargement
4. Attend que le nouveau pod soit prêt
5. Vérifie que la configuration est bien chargée

### Méthode 2 : Manuellement

#### Étape 1 : Appliquer la configuration

```bash
kubectl apply -f k8s/nginx-proxy-config.yaml
```

#### Étape 2 : Vérifier que la ConfigMap contient la configuration

```bash
kubectl get configmap nginx-proxy-config -n intelectgame -o yaml | grep -A 2 "proxy_set_header Authorization"
```

Vous devriez voir :
```yaml
proxy_set_header Authorization $http_authorization;
```

#### Étape 3 : Supprimer le pod Nginx

```bash
# Trouver le pod
NGINX_POD=$(kubectl get pods -n intelectgame -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}')

# Supprimer le pod (il sera recréé automatiquement)
kubectl delete pod $NGINX_POD -n intelectgame
```

#### Étape 4 : Attendre que le nouveau pod soit prêt

```bash
kubectl get pods -n intelectgame -l app=nginx-proxy -w
```

Appuyez sur `Ctrl+C` quand le pod est en état `Running`.

#### Étape 5 : Vérifier la configuration dans le nouveau pod

```bash
# Trouver le nouveau pod
NEW_POD=$(kubectl get pods -n intelectgame -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}')

# Vérifier la configuration
kubectl exec -n intelectgame $NEW_POD -- cat /etc/nginx/nginx.conf | grep -A 10 "location /api/game"
```

Vous devriez voir :
```nginx
location /api/game {
    # ...
    proxy_set_header Authorization $http_authorization;
    proxy_pass_request_headers on;
}
```

### Méthode 3 : Forcer le redéploiement

```bash
# Redémarrer le déploiement
kubectl rollout restart deployment/nginx-proxy -n intelectgame

# Attendre que le redéploiement soit terminé
kubectl rollout status deployment/nginx-proxy -n intelectgame --timeout=120s
```

## Vérification finale

Après avoir appliqué la correction, vérifiez :

```bash
# Utiliser le script de vérification
./k8s/scripts/verify-auth-header-transmission.sh
```

Vous devriez voir :
```
✅ proxy_set_header Authorization dans /api/game:
   Présent

✅ proxy_pass_request_headers dans /api/game:
   Activé
```

## Test

1. Rechargez la page du dashboard admin
2. Essayez de démarrer le jeu
3. Vérifiez les logs :
   ```bash
   kubectl logs -f -l app=game-service -n intelectgame | grep -i "AUTHENTICATION"
   ```

Vous devriez maintenant voir :
```
🔐 Authorization header: PRESENT
```

## Si le problème persiste

1. **Vérifier que le fichier local est correct** :
   ```bash
   grep -A 2 "proxy_set_header Authorization" k8s/nginx-proxy-config.yaml
   ```

2. **Vérifier que la ConfigMap est bien mise à jour** :
   ```bash
   kubectl get configmap nginx-proxy-config -n intelectgame -o yaml | grep -A 2 "proxy_set_header Authorization"
   ```

3. **Vérifier les événements Kubernetes** :
   ```bash
   kubectl get events -n intelectgame --sort-by='.lastTimestamp' | tail -20
   ```

4. **Supprimer et recréer la ConfigMap** :
   ```bash
   kubectl delete configmap nginx-proxy-config -n intelectgame
   kubectl apply -f k8s/nginx-proxy-config.yaml
   kubectl delete pod -n intelectgame -l app=nginx-proxy
   ```

