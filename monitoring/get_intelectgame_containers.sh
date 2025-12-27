#!/bin/bash
# Script to get all IntelectGame container IDs for Prometheus queries

echo "# IntelectGame Container IDs for Prometheus queries"
echo "# Generated on: $(date)"
echo ""

docker ps --format "{{.Names}}" | grep intelectgame | while read name; do
    id=$(docker inspect "$name" --format '{{.Id}}')
    short_id=$(echo "$id" | cut -c1-12)
    echo "# $name ($short_id)"
    echo "container_last_seen{id=\"/docker/$id\"}"
done

