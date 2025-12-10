#!/bin/bash

# Script de déploiement du stack ELK
# Usage: ./deploy-elk.sh

set -e

echo "🚀 Déploiement du stack ELK (Elasticsearch, Logstash, Kibana)..."

# Vérifier que kubectl est disponible
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Créer le namespace
echo "📦 Création du namespace 'elk'..."
kubectl create namespace elk --dry-run=client -o yaml | kubectl apply -f -

# Déployer Elasticsearch
echo "🔍 Déploiement d'Elasticsearch..."
kubectl apply -f k8s/monitoring/elk/elasticsearch-deployment.yaml

# Attendre qu'Elasticsearch soit prêt
echo "⏳ Attente qu'Elasticsearch soit prêt (peut prendre 2-3 minutes)..."
kubectl wait --for=condition=ready pod -l app=elasticsearch -n elk --timeout=300s || true

# Déployer Logstash
echo "📥 Déploiement de Logstash..."
kubectl apply -f k8s/monitoring/elk/logstash-deployment.yaml

# Déployer Filebeat
echo "📊 Déploiement de Filebeat..."
kubectl apply -f k8s/monitoring/elk/filebeat-daemonset.yaml

# Déployer Kibana
echo "📈 Déploiement de Kibana..."
kubectl apply -f k8s/monitoring/elk/kibana-deployment.yaml

# Attendre que Kibana soit prêt
echo "⏳ Attente que Kibana soit prêt..."
kubectl wait --for=condition=ready pod -l app=kibana -n elk --timeout=300s || true

# Afficher le statut
echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "📊 Statut des pods :"
kubectl get pods -n elk

echo ""
echo "🌐 Accès à Kibana :"
echo "   - NodePort: http://<NODE_IP>:30601"
echo "   - Port-forward: kubectl port-forward -n elk service/kibana 5601:5601"
echo "   - Puis ouvrez: http://localhost:5601"
echo ""
echo "📝 Pour voir les logs :"
echo "   kubectl logs -f -n elk -l app=elasticsearch"
echo "   kubectl logs -f -n elk -l app=logstash"
echo "   kubectl logs -f -n elk -l app=filebeat"
echo ""
echo "🔍 Pour vérifier les indices Elasticsearch :"
echo "   kubectl exec -it -n elk deployment/elasticsearch -- curl http://localhost:9200/_cat/indices?v"
echo ""

