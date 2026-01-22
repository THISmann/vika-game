#!/bin/bash

# Script pour commenter tous les console.log dans le frontend
# Usage: ./scripts/comment-console-logs.sh

FRONTEND_DIR="vue/front/src"

echo "🔍 Recherche des fichiers avec console.log..."

# Trouver tous les fichiers avec console.log
find "$FRONTEND_DIR" -type f \( -name "*.vue" -o -name "*.js" -o -name "*.ts" \) | while read file; do
  if grep -q "console\." "$file"; then
    echo "📝 Traitement de: $file"
    
    # Créer une copie de sauvegarde
    cp "$file" "$file.bak"
    
    # Commenter tous les console.log, console.warn, console.error, console.debug, console.info
    # En préservant l'indentation
    sed -i.tmp \
      -e 's/^\([[:space:]]*\)console\.log(/\1\/\/ console.log(/g' \
      -e 's/^\([[:space:]]*\)console\.warn(/\1\/\/ console.warn(/g' \
      -e 's/^\([[:space:]]*\)console\.error(/\1\/\/ console.error(/g' \
      -e 's/^\([[:space:]]*\)console\.debug(/\1\/\/ console.debug(/g' \
      -e 's/^\([[:space:]]*\)console\.info(/\1\/\/ console.info(/g' \
      "$file"
    
    # Supprimer le fichier temporaire
    rm -f "$file.tmp"
    
    # Vérifier si des changements ont été faits
    if ! diff -q "$file" "$file.bak" > /dev/null; then
      echo "  ✅ Modifié"
      rm "$file.bak"
    else
      echo "  ⚠️  Aucun changement (peut-être déjà commenté)"
      rm "$file.bak"
    fi
  fi
done

echo "✅ Terminé!"
