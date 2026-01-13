# Guide de Dépannage

## 1. Nginx Ingress Controller - Erreurs mais site fonctionne

### Pourquoi ces erreurs ?

Le Nginx Ingress Controller affiche des erreurs car :
1. **Il n'est pas utilisé** : Vous utilisez votre propre proxy Nginx (`nginx-proxy`) dans le namespace `intelectgame`
2. **Permissions manquantes** : Le ServiceAccount n'a pas les permissions nécessaires pour gérer les Ingress Classes
3. **Variables d'environnement manquantes** : `POD_NAME` et `POD_NAMESPACE` ne sont pas définies

### Solution

Ces erreurs sont **non bloquantes** car vous n'utilisez pas ce controller. Vous pouvez :

**Option 1 : Ignorer les erreurs** (recommandé)
- Le site fonctionne car vous utilisez `nginx-proxy`, pas le Nginx Ingress Controller

**Option 2 : Désactiver le Nginx Ingress Controller**
```bash
helm delete nginx-ingress -n nginx-ingress
```

**Option 3 : Corriger les permissions** (si vous voulez l'utiliser)
```bash
# Créer un ServiceAccount avec les bonnes permissions
kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: nginx-ingress
  namespace: nginx-ingress
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: nginx-ingress
rules:
- apiGroups: [""]
  resources: ["configmaps", "endpoints", "nodes", "pods", "secrets"]
  verbs: ["list", "watch"]
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["get"]
- apiGroups: [""]
  resources: ["services"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["networking.k8s.io"]
  resources: ["ingresses"]
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources: ["events"]
  verbs: ["create", "patch"]
- apiGroups: ["networking.k8s.io"]
  resources: ["ingressclasses"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: nginx-ingress
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: nginx-ingress
subjects:
- kind: ServiceAccount
  name: nginx-ingress
  namespace: nginx-ingress
EOF
```

## 2. Accès au Dashboard Grafana

### Méthode 1 : Port-Forward (Recommandé)

```bash
# Démarrer le port-forward
kubectl port-forward -n monitoring service/grafana 3000:3000

# Accéder à Grafana
# URL: http://localhost:3000
# Username: admin (par défaut)
# Password: admin (par défaut, voir values.yaml)
```

### Méthode 2 : NodePort (si configuré)

```bash
# Vérifier le service
kubectl get svc -n monitoring grafana

# Si type NodePort, utiliser minikube service
minikube service grafana -n monitoring
```

### Script automatique

```bash
./k8s/local/scripts/access-grafana.sh
```

## 3. Configuration des Logs (ELK Stack)

### Architecture des Logs

```
Microservices → Filebeat → Logstash → Elasticsearch → Grafana
```

### Vérification de la Configuration

1. **Filebeat** : Collecte les logs des pods
2. **Logstash** : Filtre et transforme les logs
3. **Elasticsearch** : Stocke les logs
4. **Grafana** : Visualise les logs depuis Elasticsearch

### Vérifier que tout fonctionne

```bash
# 1. Vérifier Filebeat
kubectl get pods -n elk -l app=filebeat
kubectl logs -n elk -l app=filebeat --tail=20

# 2. Vérifier Logstash
kubectl get pods -n elk -l app=logstash
kubectl logs -n elk -l app=logstash --tail=20

# 3. Vérifier Elasticsearch
kubectl get pods -n elk -l app=elasticsearch
kubectl logs -n elk -l app=elasticsearch --tail=20

# 4. Vérifier que les logs arrivent dans Elasticsearch
kubectl exec -n elk -it $(kubectl get pods -n elk -l app=elasticsearch -o name | head -1 | cut -d/ -f2) -- \
  curl -s http://localhost:9200/_cat/indices?v
```

### Configuration Grafana pour Elasticsearch

1. Se connecter à Grafana
2. Aller dans **Configuration > Data Sources**
3. Ajouter **Elasticsearch**
4. Configuration :
   - **URL**: `http://elasticsearch.elk.svc.cluster.local:9200`
   - **Access**: Server (default)
   - **Index name**: `logstash-*` (ou l'index configuré dans Logstash)
   - **Time field name**: `@timestamp`

