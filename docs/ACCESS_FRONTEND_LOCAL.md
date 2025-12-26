# Accéder au Frontend en Local (Minikube)

Le frontend est déployé dans Kubernetes et n'est pas directement accessible sur `localhost:5173`. Voici plusieurs méthodes pour y accéder :

## Méthode 1 : Port-Forward (Recommandé pour développement)

### Option A : Script automatique

```bash
./k8s/local/scripts/access-frontend.sh
```

### Option B : Commande manuelle

```bash
kubectl port-forward -n intelectgame service/frontend 5173:5173
```

Puis ouvrez votre navigateur sur : **http://localhost:5173**

> 💡 **Note** : Le port-forward doit rester actif. Appuyez sur `Ctrl+C` pour l'arrêter.

## Méthode 2 : NodePort (Permanent)

Le service frontend peut être configuré en `NodePort` pour un accès permanent :

1. **Modifier la configuration** :
   ```bash
   # Éditer k8s/local/helm/app/values.yaml
   # Changer service.type de ClusterIP à NodePort
   ```

2. **Redéployer** :
   ```bash
   helm upgrade app ./k8s/local/helm/app -n intelectgame
   ```

3. **Accéder via Minikube IP** :
   ```bash
   minikube ip  # Affiche l'IP (ex: 192.168.58.2)
   # Ouvrir http://192.168.58.2:30080
   ```

   Ou utiliser :
   ```bash
   minikube service frontend -n intelectgame
   ```

## Méthode 3 : Ingress (Si configuré)

Si vous avez configuré un Ingress Controller :

```bash
# Vérifier l'ingress
kubectl get ingress -n intelectgame

# Obtenir l'URL
minikube service ingress-nginx -n nginx-ingress
```

## Vérification

Pour vérifier que le frontend fonctionne :

```bash
# Vérifier les pods
kubectl get pods -n intelectgame -l app=frontend

# Vérifier le service
kubectl get svc -n intelectgame frontend

# Voir les logs
kubectl logs -n intelectgame -l app=frontend
```

## Dépannage

### Le port-forward ne fonctionne pas

```bash
# Vérifier que le service existe
kubectl get svc -n intelectgame frontend

# Vérifier que les pods sont prêts
kubectl get pods -n intelectgame -l app=frontend

# Tuer les processus port-forward existants
pkill -f "kubectl port-forward"
```

### Le frontend ne répond pas

```bash
# Vérifier les logs du pod
kubectl logs -n intelectgame -l app=frontend

# Vérifier les événements
kubectl describe pod -n intelectgame -l app=frontend
```

