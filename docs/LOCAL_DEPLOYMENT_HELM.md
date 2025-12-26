# Déploiement Local avec Minikube et Helm

## Vue d'ensemble

Ce guide explique comment déployer l'application en local avec Minikube et Helm, en utilisant les images Docker locales et en organisant les services par namespaces.

## Structure des namespaces

- **database** : MongoDB, Redis
- **monitoring** : Grafana, Prometheus
- **nginx-ingress** : Nginx Ingress Controller
- **elk** : Elasticsearch, Logstash, Kibana, Filebeat
- **intelectgame** : Application (auth, quiz, game, frontend, telegram-bot)

## Prérequis

```bash
# Installer Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Installer Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Installer kubectl
# (selon votre OS)
```

## Déploiement

### 1. Configuration initiale

```bash
# Configurer Minikube et créer les namespaces
./k8s/local/scripts/setup-minikube.sh
```

### 2. Construire les images locales

```bash
# Construire toutes les images et les charger dans Minikube
./k8s/local/scripts/build-local-images.sh
```

### 3. Déployer avec Helm

```bash
# Déployer tous les services
./k8s/local/scripts/deploy-local.sh
```

## Versioning avec Helm

Helm permet un versioning facile des déploiements :

```bash
# Voir l'historique des versions
helm history app -n intelectgame

# Rollback vers une version précédente
helm rollback app <revision-number> -n intelectgame

# Mettre à jour avec de nouvelles valeurs
helm upgrade app k8s/local/helm/app -n intelectgame -f k8s/local/values/app-values.yaml
```

## Utilisation des images locales

Les images sont construites localement et chargées dans Minikube via `eval $(minikube docker-env)`. Le `imagePullPolicy: Never` dans les charts Helm garantit que Minikube utilise les images locales.

## Accès aux services

```bash
# Port forward
kubectl port-forward -n monitoring svc/grafana 3000:3000
kubectl port-forward -n elk svc/kibana 5601:5601

# Via Minikube service
minikube service grafana -n monitoring
minikube service kibana -n elk
```

## Nettoyage

```bash
# Supprimer tous les déploiements
./k8s/local/scripts/cleanup.sh
```


