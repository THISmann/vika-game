# Correction : Erreur "Connection reset by peer" sur localhost:5173

## Problème

```bash
curl http://localhost:5173/
curl: (56) Recv failure: Connection reset by peer
```

**Cause** : Le port-forward vers le frontend n'est plus actif ou le service n'est pas accessible.

## Solutions

### Solution 1 : Script automatique (Recommandé)

```bash
./k8s/local/scripts/fix-frontend-access.sh
```

### Solution 2 : Vérification manuelle

#### 1. Vérifier que le port-forward est actif

```bash
ps aux | grep "kubectl port-forward.*5173" | grep -v grep
```

Si rien n'apparaît, le port-forward n'est pas actif.

#### 2. Vérifier le service

```bash
# Vérifier nginx-proxy (si utilisé)
kubectl get svc -n intelectgame nginx-proxy

# Ou vérifier le service frontend
kubectl get svc -n intelectgame -l app=frontend
```

#### 3. Vérifier les pods

```bash
# Vérifier nginx-proxy
kubectl get pods -n intelectgame -l app=nginx-proxy

# Ou vérifier le frontend
kubectl get pods -n intelectgame -l app=frontend
```

#### 4. Redémarrer le port-forward

```bash
# Arrêter les port-forwards existants
pkill -f "kubectl port-forward.*5173"
pkill -f "kubectl port-forward.*nginx-proxy"

# Démarrer le port-forward vers nginx-proxy
kubectl port-forward -n intelectgame service/nginx-proxy 5173:80

# Ou vers le frontend directement
kubectl port-forward -n intelectgame service/frontend 5173:5173
```

### Solution 3 : Port-forward en arrière-plan

```bash
# Arrêter les port-forwards existants
pkill -f "kubectl port-forward.*5173"

# Démarrer en arrière-plan
kubectl port-forward -n intelectgame service/nginx-proxy 5173:80 > /tmp/frontend-port-forward.log 2>&1 &

# Vérifier qu'il fonctionne
sleep 2
curl http://localhost:5173/
```

### Solution 4 : Utiliser le NodePort (si configuré)

Si le service est de type NodePort, vous pouvez accéder directement via l'IP de Minikube :

```bash
# Obtenir l'IP de Minikube
minikube ip

# Obtenir le NodePort
kubectl get svc -n intelectgame nginx-proxy -o jsonpath='{.spec.ports[0].nodePort}'

# Accéder via http://<minikube-ip>:<nodePort>
```

## Diagnostic

### Vérifier l'état du cluster

```bash
# Vérifier que Minikube est démarré
minikube status

# Si Minikube n'est pas démarré
minikube start
```

### Vérifier les logs du pod

```bash
# Logs nginx-proxy
kubectl logs -n intelectgame -l app=nginx-proxy --tail=20

# Logs frontend
kubectl logs -n intelectgame -l app=frontend --tail=20
```

### Vérifier les événements

```bash
kubectl get events -n intelectgame --sort-by='.lastTimestamp' | tail -10
```

## Scripts Disponibles

- `./k8s/local/scripts/fix-frontend-access.sh` - Corriger l'accès au frontend
- `./k8s/local/scripts/access-frontend.sh` - Accéder au frontend (ancien script)

## Dépannage Avancé

### Le port 5173 est déjà utilisé

```bash
# Trouver le processus qui utilise le port
lsof -i :5173

# Tuer le processus
kill -9 <PID>
```

### Le service n'existe pas

```bash
# Redéployer l'application
helm upgrade --install app ./k8s/local/helm/app -n intelectgame
```

### Le pod ne démarre pas

```bash
# Vérifier les logs
kubectl describe pod -n intelectgame -l app=nginx-proxy

# Vérifier les ressources
kubectl top pods -n intelectgame
```

