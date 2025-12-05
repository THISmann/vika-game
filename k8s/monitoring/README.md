# 📊 Monitoring avec Grafana + Loki + Promtail

Solution simple pour collecter et visualiser tous les logs de vos pods Kubernetes.

## 🏗️ Architecture

```
┌─────────────┐
│   Pods      │ ──logs──> ┌──────────┐
│ Kubernetes  │           │ Promtail │ ──> ┌──────┐
└─────────────┘           └──────────┘     │ Loki │ ──> ┌─────────┐
                                            └──────┘     │ Grafana │
                                                         └─────────┘
```

- **Promtail** : Collecte les logs de tous les pods (DaemonSet)
- **Loki** : Stocke et indexe les logs
- **Grafana** : Interface de visualisation et d'analyse

## 🚀 Déploiement

### Option 1 : Script automatique

```bash
cd ~/vika-game
./k8s/monitoring/deploy-monitoring.sh
```

### Option 2 : Déploiement manuel

```bash
# 1. Loki
kubectl apply -f k8s/monitoring/loki-config.yaml
kubectl apply -f k8s/monitoring/loki-deployment.yaml

# 2. Promtail
kubectl apply -f k8s/monitoring/promtail-config.yaml
kubectl apply -f k8s/monitoring/promtail-daemonset.yaml

# 3. Grafana
kubectl apply -f k8s/monitoring/grafana-deployment.yaml
```

## 🔐 Accès à Grafana

### Sur Minikube local

```bash
kubectl port-forward -n intelectgame service/grafana 3000:3000
```

Puis ouvrez : http://localhost:3000

### Sur VM avec NodePort

Accédez via : `http://<VM_IP>:30300`

**Credentials :**
- Username: `admin`
- Password: `admin123`

⚠️ **Important** : Changez le mot de passe après la première connexion !

## 📊 Utilisation dans Grafana

### 1. Vérifier la connexion à Loki

1. Allez dans **Configuration** → **Data Sources**
2. Vérifiez que **Loki** est configuré et testé (bouton "Test")

### 2. Requêtes LogQL de base

Dans **Explore** ou créez un dashboard :

#### Voir tous les logs
```logql
{namespace="intelectgame"}
```

#### Logs d'un service spécifique
```logql
{namespace="intelectgame", app="game-service"}
```

#### Logs d'un pod spécifique
```logql
{namespace="intelectgame", pod="game-service-xxxxx-xxxxx"}
```

#### Rechercher une erreur
```logql
{namespace="intelectgame"} |= "error"
```

#### Rechercher un pattern
```logql
{namespace="intelectgame"} |~ "409 Conflict"
```

#### Logs des dernières 5 minutes
```logql
{namespace="intelectgame"} [5m]
```

### 3. Exemples de requêtes utiles

#### Erreurs dans tous les services
```logql
{namespace="intelectgame"} |~ "(?i)(error|exception|failed|❌)"
```

#### Logs du bot Telegram
```logql
{namespace="intelectgame", app="telegram-bot"}
```

#### Logs WebSocket
```logql
{namespace="intelectgame"} |~ "WebSocket|socket|polling"
```

#### Logs de connexion
```logql
{namespace="intelectgame"} |~ "connected|disconnected|register"
```

## 📈 Créer un Dashboard

### Dashboard simple pour surveiller les erreurs

1. **Nouveau Dashboard** → **Add visualization**
2. **Data source** : Loki
3. **Query** :
   ```logql
   sum(count_over_time({namespace="intelectgame"} |~ "(?i)(error|exception|failed)" [1m]))
   ```
4. **Visualization** : Graph ou Stat
5. **Panel title** : "Erreurs par minute"

### Dashboard pour chaque service

Créez un panel par service :

**Game Service :**
```logql
{namespace="intelectgame", app="game-service"}
```

**Auth Service :**
```logql
{namespace="intelectgame", app="auth-service"}
```

**Telegram Bot :**
```logql
{namespace="intelectgame", app="telegram-bot"}
```

## 🔍 Détection de problèmes

### Alertes simples (à configurer dans Grafana)

1. **Alertes sur erreurs** :
   - Requête : `count_over_time({namespace="intelectgame"} |~ "error" [5m]) > 10`
   - Message : "Trop d'erreurs détectées"

2. **Alertes sur pods en crash** :
   - Requête : `{namespace="intelectgame"} |~ "CrashLoopBackOff|Error|Failed"`
   - Message : "Pod en erreur détecté"

3. **Alertes sur WebSocket** :
   - Requête : `{namespace="intelectgame"} |~ "WebSocket.*error|409 Conflict"`
   - Message : "Problème WebSocket détecté"

## 🛠️ Maintenance

### Vérifier le statut

```bash
# Vérifier les pods
kubectl get pods -n intelectgame | grep -E 'loki|promtail|grafana'

# Vérifier les logs de Loki
kubectl logs -n intelectgame -l app=loki

# Vérifier les logs de Promtail
kubectl logs -n intelectgame -l app=promtail
```

### Redémarrer un service

```bash
kubectl rollout restart deployment/loki -n intelectgame
kubectl rollout restart deployment/grafana -n intelectgame
kubectl rollout restart daemonset/promtail -n intelectgame
```

### Supprimer le monitoring

```bash
kubectl delete -f k8s/monitoring/
```

## 📝 Notes

- **Stockage** : Loki utilise `emptyDir` (temporaire). Pour la production, utilisez un PersistentVolume.
- **Rétention** : Par défaut, les logs sont conservés 7 jours. Modifiable dans `loki-config.yaml`.
- **Performance** : Pour de gros volumes, augmentez les ressources dans les deployments.

## 🔗 Ressources

- [Documentation Loki](https://grafana.com/docs/loki/latest/)
- [Documentation Promtail](https://grafana.com/docs/loki/latest/clients/promtail/)
- [LogQL Query Language](https://grafana.com/docs/loki/latest/logql/)

