# 🔍 Guide : Vérifier les pods Kubernetes

Guide complet pour vérifier l'état de tous vos pods dans Kubernetes.

## 🚀 Commandes rapides

### Vérifier tous les pods

```bash
# Script automatique (recommandé)
./k8s/scripts/check-pods.sh

# Ou manuellement
kubectl get pods -n intelectgame
```

### Vérifier un service spécifique

```bash
# Vérifier un service spécifique
./k8s/scripts/check-pods.sh auth-service
./k8s/scripts/check-pods.sh quiz-service
./k8s/scripts/check-pods.sh game-service
./k8s/scripts/check-pods.sh api-gateway
./k8s/scripts/check-pods.sh frontend
```

### Vérification complète

```bash
# Vérifier tout (pods, services, deployments, etc.)
./k8s/scripts/check-all.sh
```

## 📋 Commandes kubectl utiles

### 1. Liste des pods

```bash
# Liste simple
kubectl get pods -n intelectgame

# Liste détaillée avec IP et nœud
kubectl get pods -n intelectgame -o wide

# Liste avec plus de détails
kubectl get pods -n intelectgame -o custom-columns=NAME:.metadata.name,STATUS:.status.phase,READY:.status.containerStatuses[0].ready,RESTARTS:.status.containerStatuses[0].restartCount
```

### 2. Détails d'un pod

```bash
# Décrire un pod (événements, erreurs, etc.)
kubectl describe pod <pod-name> -n intelectgame

# Exemple
kubectl describe pod auth-service-7d4b8c9f5-abc123 -n intelectgame
```

### 3. Logs des pods

```bash
# Logs d'un pod spécifique
kubectl logs <pod-name> -n intelectgame

# Logs en temps réel (suivre)
kubectl logs -f <pod-name> -n intelectgame

# Dernières lignes
kubectl logs <pod-name> -n intelectgame --tail=50

# Logs depuis un timestamp
kubectl logs <pod-name> -n intelectgame --since=10m

# Logs de tous les pods d'un service
kubectl logs -f -l app=auth-service -n intelectgame
```

### 4. Événements

```bash
# Événements du namespace
kubectl get events -n intelectgame --sort-by='.lastTimestamp'

# Événements d'un pod spécifique
kubectl get events -n intelectgame --field-selector involvedObject.name=<pod-name>
```

### 5. Services

```bash
# Liste des services
kubectl get services -n intelectgame

# Détails d'un service
kubectl describe service <service-name> -n intelectgame
```

### 6. Deployments

```bash
# Liste des deployments
kubectl get deployments -n intelectgame

# Détails d'un deployment
kubectl describe deployment <deployment-name> -n intelectgame

# Historique d'un deployment
kubectl rollout history deployment/<deployment-name> -n intelectgame
```

## 🔍 Diagnostic des problèmes

### Pod en état Pending

```bash
# Voir pourquoi le pod est en Pending
kubectl describe pod <pod-name> -n intelectgame

# Vérifier les événements
kubectl get events -n intelectgame --field-selector involvedObject.name=<pod-name>
```

**Causes courantes** :
- Ressources insuffisantes (CPU/Memory)
- Image Docker non disponible
- Volume non monté

### Pod en CrashLoopBackOff

```bash
# Voir les logs pour comprendre l'erreur
kubectl logs <pod-name> -n intelectgame --previous

# Décrire le pod pour voir les événements
kubectl describe pod <pod-name> -n intelectgame
```

**Causes courantes** :
- Erreur dans le code
- Configuration incorrecte
- Variables d'environnement manquantes
- Connexion à la base de données échouée

### Pod ne démarre pas

```bash
# Vérifier les événements
kubectl describe pod <pod-name> -n intelectgame | grep Events -A 10

# Vérifier les logs du conteneur
kubectl logs <pod-name> -n intelectgame
```

### Service non accessible

```bash
# Vérifier que le service existe
kubectl get service <service-name> -n intelectgame

# Vérifier les endpoints
kubectl get endpoints <service-name> -n intelectgame

# Tester depuis un pod
kubectl exec -n intelectgame <pod-name> -- curl http://<service-name>:<port>/health
```

## 📊 Vérification par service

### Auth Service

```bash
# Vérifier les pods
kubectl get pods -l app=auth-service -n intelectgame

# Vérifier le service
kubectl get service auth-service -n intelectgame

# Tester depuis un pod
kubectl exec -n intelectgame <pod-name> -- curl http://auth-service:3001/health
```

### Quiz Service

```bash
# Vérifier les pods
kubectl get pods -l app=quiz-service -n intelectgame

# Vérifier le service
kubectl get service quiz-service -n intelectgame

# Tester depuis un pod
kubectl exec -n intelectgame <pod-name> -- curl http://quiz-service:3002/health
```

### Game Service

```bash
# Vérifier les pods
kubectl get pods -l app=game-service -n intelectgame

# Vérifier le service
kubectl get service game-service -n intelectgame

# Tester depuis un pod
kubectl exec -n intelectgame <pod-name> -- curl http://game-service:3003/health
```

### API Gateway

```bash
# Vérifier les pods
kubectl get pods -l app=api-gateway -n intelectgame

# Vérifier le service
kubectl get service api-gateway -n intelectgame

# Tester depuis un pod
kubectl exec -n intelectgame <pod-name> -- curl http://api-gateway:3000/health
```

### Frontend

```bash
# Vérifier les pods
kubectl get pods -l app=frontend -n intelectgame

# Vérifier le service
kubectl get service frontend -n intelectgame

# Obtenir l'URL d'accès
minikube service frontend -n intelectgame
```

## 🔧 Actions de dépannage

### Redémarrer un service

```bash
# Redémarrer un deployment
kubectl rollout restart deployment/<service-name> -n intelectgame

# Exemple
kubectl rollout restart deployment/auth-service -n intelectgame
```

### Supprimer un pod (sera recréé automatiquement)

```bash
# Supprimer un pod
kubectl delete pod <pod-name> -n intelectgame
```

### Redémarrer tous les services

```bash
# Redémarrer tous les deployments
kubectl rollout restart deployment -n intelectgame
```

### Vérifier les ressources

```bash
# Utilisation des ressources
kubectl top pods -n intelectgame

# Utilisation des nœuds
kubectl top nodes
```

## 📝 Checklist de vérification

- [ ] Tous les pods sont en état `Running`
- [ ] Tous les pods sont `Ready` (1/1 ou 2/2)
- [ ] Aucun pod en `CrashLoopBackOff`
- [ ] Aucun pod en `Pending` depuis plus de 5 minutes
- [ ] Les services sont accessibles
- [ ] Les logs ne montrent pas d'erreurs critiques
- [ ] Les ConfigMaps et Secrets sont présents

## 🆘 En cas de problème

1. **Vérifier les logs** :
   ```bash
   kubectl logs <pod-name> -n intelectgame
   ```

2. **Vérifier les événements** :
   ```bash
   kubectl describe pod <pod-name> -n intelectgame
   ```

3. **Vérifier la configuration** :
   ```bash
   kubectl get configmap app-config -n intelectgame -o yaml
   ```

4. **Redémarrer le service** :
   ```bash
   kubectl rollout restart deployment/<service-name> -n intelectgame
   ```

## 📚 Ressources

- [Documentation Kubernetes](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- `k8s/README.md` - Documentation du projet
- `k8s/docs/VM_DEPLOYMENT.md` - Guide de déploiement

