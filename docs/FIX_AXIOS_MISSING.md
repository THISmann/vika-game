# 🔧 Correction : Module 'axios' Manquant

## 🐛 Problème

Erreur lors du démarrage du quiz-service dans Docker :
```
Error: Cannot find module 'axios'
```

## ✅ Solution Appliquée

Le middleware d'authentification utilise `axios` pour vérifier les tokens via l'API, mais `axios` n'était pas dans les dépendances du quiz-service.

**Correction** : Ajout de `axios` dans `node/quiz-service/package.json`

## 📋 Dépendances Requises

Pour que le middleware d'authentification fonctionne, chaque service qui l'utilise doit avoir :

```json
{
  "dependencies": {
    "axios": "^1.13.2",
    ...
  }
}
```

## 🔄 Rebuild Docker

Après avoir ajouté la dépendance, reconstruisez l'image :

```bash
# Reconstruire le quiz-service
docker-compose build quiz

# Redémarrer
docker-compose up quiz
```

Ou reconstruire tous les services :

```bash
docker-compose build
docker-compose up
```

## ✅ Vérification

Après le rebuild, le service devrait démarrer sans erreur. Vérifiez les logs :

```bash
docker-compose logs quiz
```

Vous ne devriez plus voir l'erreur "Cannot find module 'axios'".

