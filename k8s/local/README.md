# Déploiement Local avec Minikube et Helm

## Structure

```
k8s/local/
├── helm/
│   ├── database/          # MongoDB, Redis
│   ├── monitoring/         # Grafana, Prometheus
│   ├── nginx-ingress/      # Nginx Ingress Controller
│   ├── elk/               # Elasticsearch, Logstash, Kibana
│   └── app/               # Application (auth, quiz, game, frontend, telegram-bot)
├── scripts/
│   ├── setup-minikube.sh
│   ├── build-local-images.sh
│   ├── deploy-local.sh
│   └── cleanup.sh
└── values/
    └── (fichiers values.yaml dans chaque chart)
```

## Prérequis

- Minikube installé et démarré
- Helm 3 installé
- Docker Desktop ou Docker Engine
- kubectl configuré

## Déploiement rapide

```bash
# 1. Configurer Minikube
./k8s/local/scripts/setup-minikube.sh

# 2. Construire les images locales
./k8s/local/scripts/build-local-images.sh

# 3. Déployer tous les services
./k8s/local/scripts/deploy-local.sh
```

## Utilisation des images locales

Minikube utilise les images Docker de la machine locale via `imagePullPolicy: Never`. Les images sont construites localement et chargées dans Minikube.

## Namespaces

- `database` : MongoDB, Redis
- `monitoring` : Grafana, Prometheus
- `nginx-ingress` : Nginx Ingress Controller
- `elk` : Elasticsearch, Logstash, Kibana, Filebeat
- `intelectgame` : Application (auth, quiz, game, frontend, telegram-bot)

## Versioning avec Helm

Helm permet un versioning facile via les releases :

```bash
# Mettre à jour une release
helm upgrade app k8s/local/helm/app -n intelectgame

# Voir l'historique des versions
helm history app -n intelectgame

# Rollback vers une version précédente
helm rollback app <revision-number> -n intelectgame
```

## Accès aux services

```bash
# Port forward pour accéder aux services
kubectl port-forward -n monitoring svc/grafana 3000:3000
kubectl port-forward -n elk svc/kibana 5601:5601
kubectl port-forward -n monitoring svc/prometheus 9090:9090

# Accéder via Minikube
minikube service grafana -n monitoring
minikube service kibana -n elk
```
