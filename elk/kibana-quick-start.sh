#!/bin/bash

# Script pour vérifier que Kibana est prêt et afficher les instructions
# Usage: ./elk/kibana-quick-start.sh

set -e

echo "🔍 Vérification de Kibana..."

# Vérifier que Kibana est accessible
if ! curl -s http://localhost:5601/api/status > /dev/null 2>&1; then
    echo "❌ Kibana n'est pas accessible sur http://localhost:5601"
    echo "   Vérifiez que le service est démarré :"
    echo "   docker-compose -f docker-compose.elk.yml ps"
    exit 1
fi

# Vérifier qu'Elasticsearch est accessible
if ! curl -s http://localhost:9200/_cluster/health > /dev/null 2>&1; then
    echo "❌ Elasticsearch n'est pas accessible sur http://localhost:9200"
    exit 1
fi

# Vérifier les indices
echo ""
echo "📊 Indices disponibles :"
curl -s http://localhost:9200/_cat/indices?v 2>/dev/null | grep -E "gamev2|health|status" || echo "   Aucun index gamev2 trouvé (normal si aucun log n'a été collecté)"

echo ""
echo "✅ Kibana est prêt !"
echo ""
echo "🌐 Accès à Kibana : http://localhost:5601"
echo ""
echo "📋 Étapes suivantes :"
echo ""
echo "1. Ouvrez Kibana dans votre navigateur : http://localhost:5601"
echo ""
echo "2. Créez un index pattern :"
echo "   - Management → Stack Management → Index Patterns"
echo "   - Create index pattern : gamev2-logs-*"
echo "   - Time field : @timestamp"
echo ""
echo "3. Explorez les logs :"
echo "   - Analytics → Discover"
echo "   - Sélectionnez l'index pattern : gamev2-logs-*"
echo ""
echo "4. Créez des visualisations :"
echo "   - Analytics → Visualize Library"
echo "   - Create visualization"
echo ""
echo "5. Créez un dashboard :"
echo "   - Analytics → Dashboards"
echo "   - Create dashboard"
echo ""
echo "📖 Guide complet : elk/KIBANA_VISUALIZATION_GUIDE.md"
echo ""

