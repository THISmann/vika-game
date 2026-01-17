# 🔧 Fix Docker Compose KeyError: 'ContainerConfig'

## ❌ Problème

Erreur `KeyError: 'ContainerConfig'` lors de `docker-compose up` :

```
ERROR: for 71fc11049ba9_intelectgame-auth  'ContainerConfig'
KeyError: 'ContainerConfig'
```

## 🔍 Cause

Cette erreur est un bug connu de docker-compose qui se produit quand :
- Les containers sont dans un état incohérent
- Les images/containers sont orphelins
- La version de docker-compose a des problèmes avec certaines images

## ✅ Solution

### Méthode 1 : Nettoyage complet (Recommandé)

```bash
# 1. Arrêter tous les services
docker-compose stop

# 2. Supprimer tous les containers
docker-compose rm -f

# 3. Nettoyer les containers orphelins
docker container prune -f

# 4. Redémarrer les services
docker-compose up -d
```

### Méthode 2 : Suppression du container problématique

```bash
# Supprimer le container problématique spécifiquement
docker rm -f 71fc11049ba9

# Redémarrer les services
docker-compose up -d
```

### Méthode 3 : Recréation complète (Si les méthodes 1 et 2 ne fonctionnent pas)

```bash
# 1. Arrêter et supprimer tous les containers
docker-compose down

# 2. Supprimer les volumes orphelins (ATTENTION : perte de données)
docker volume prune -f

# 3. Redémarrer les services
docker-compose up -d
```

## 📝 Notes

- **Méthode 1** : Recommandée car elle nettoie seulement les containers orphelins sans toucher aux volumes
- **Méthode 2** : Pour supprimer un container spécifique qui cause le problème
- **Méthode 3** : Dernier recours si les autres méthodes ne fonctionnent pas (⚠️ peut supprimer des données)

## 🔄 Après le fix

Vérifier que tous les services sont démarrés :

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}'
```

Vérifier les variables d'environnement des frontends :

```bash
docker exec intelectgame-frontend env | grep VITE
docker exec intelectgame-admin-frontend env | grep VITE
```

Devrait afficher :
```
VITE_AUTH_SERVICE_URL=/vika-game/api
VITE_QUIZ_SERVICE_URL=/vika-game/api
VITE_GAME_SERVICE_URL=/vika-game/api
```

