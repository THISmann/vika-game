# Dépannage - Accès public au proxy Nginx

## Problème : "Connection refused" sur le port 30081

Si le pod Nginx est en état `Running` mais que vous ne pouvez pas accéder à l'application depuis l'extérieur, voici les solutions :

## Solution 1 : Utiliser minikube tunnel (Recommandé)

Minikube n'expose pas automatiquement les NodePorts sur l'interface publique. Utilisez `minikube tunnel` :

```bash
# Dans un terminal séparé (ou en arrière-plan)
sudo minikube tunnel

# OU en arrière-plan
sudo nohup minikube tunnel > /tmp/minikube-tunnel.log 2>&1 &
```

**Avantages :**
- Expose automatiquement tous les services NodePort
- Fonctionne avec les services LoadBalancer
- Pas besoin de configurer manuellement les routes

**Inconvénients :**
- Doit rester actif en permanence
- Nécessite les privilèges sudo

## Solution 2 : Utiliser l'IP de Minikube directement

Si vous ne voulez pas utiliser `minikube tunnel`, accédez directement via l'IP de Minikube :

```bash
# Obtenir l'IP de Minikube
MINIKUBE_IP=$(minikube ip)
echo "Accès via: http://$MINIKUBE_IP:30081"

# Ouvrir le firewall pour cette IP
sudo ufw allow from $MINIKUBE_IP to any port 30081
```

## Solution 3 : Configurer un service LoadBalancer

Au lieu d'utiliser NodePort, vous pouvez utiliser un service LoadBalancer avec `minikube tunnel` :

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-proxy
  namespace: intelectgame
spec:
  type: LoadBalancer  # Au lieu de NodePort
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: nginx-proxy
```

## Vérifications

### 1. Vérifier que le service est correctement configuré

```bash
kubectl get service nginx-proxy -n intelectgame
kubectl get endpoints nginx-proxy -n intelectgame
```

### 2. Vérifier que le pod est en état Running

```bash
kubectl get pods -n intelectgame | grep nginx-proxy
```

### 3. Tester depuis l'intérieur du cluster

```bash
kubectl run test-curl --rm -i --restart=Never --image=curlimages/curl:latest -- \
    curl http://nginx-proxy.intelectgame.svc.cluster.local
```

### 4. Vérifier le firewall

```bash
# Vérifier les règles
sudo ufw status

# Ouvrir le port si nécessaire
sudo ufw allow 30081/tcp
```

### 5. Vérifier que minikube tunnel est actif

```bash
# Vérifier si minikube tunnel tourne
pgrep -f "minikube tunnel"

# Voir les logs
sudo cat /tmp/minikube-tunnel.log
```

## Scripts utiles

- `./k8s/diagnose-nginx-access.sh` - Diagnostic complet
- `./k8s/expose-public-tunnel.sh` - Configuration automatique avec minikube tunnel

## Accès final

Une fois configuré, accédez à l'application via :

- **Avec minikube tunnel** : `http://VOTRE_IP_PUBLIQUE:30081`
- **Sans minikube tunnel** : `http://$(minikube ip):30081`

## Problèmes courants

### Le port est ouvert mais "Connection refused"

➡️ **Solution** : Démarrez `minikube tunnel`

### Le service répond mais avec des erreurs 502

➡️ **Solution** : Vérifiez que les services backend (frontend, auth-service, etc.) sont en état Running

### minikube tunnel ne démarre pas

➡️ **Solution** : Vérifiez les permissions sudo et que Minikube est démarré

```bash
minikube status
sudo minikube tunnel
```

