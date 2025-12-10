# 🔧 Correction : Erreur de Build Docker

## 🐛 Problème

Erreur lors du build Docker :
```
cannot replace to directory /app/shared with file
```

## 🔍 Cause

Le problème vient du fait que :
1. Le Dockerfile copie d'abord `shared` (ligne 4) : `COPY shared ./shared`
2. Ensuite il copie `auth-service/` (ligne 10) : `COPY auth-service/ .`
3. Mais `auth-service/` contient un **lien symbolique** `shared -> ../shared`
4. Docker ne peut pas remplacer un dossier par un lien symbolique

## ✅ Solution Appliquée

### 1. Fichiers `.dockerignore`

Création de fichiers `.dockerignore` dans chaque service pour exclure `shared` lors de la copie :

```
shared
node_modules
__tests__
*.test.js
*.log
.env
.env.local
```

### 2. Correction des Dockerfiles

Ajout d'une commande pour gérer le lien symbolique :

```dockerfile
# Ensure shared directory exists (remove symlink if present and use the copied one)
RUN if [ -L shared ]; then rm shared && cp -r ../shared ./shared 2>/dev/null || true; fi
```

Cette commande :
- Vérifie si `shared` est un lien symbolique
- Le supprime si c'est le cas
- Utilise le vrai dossier `shared` déjà copié

## 🔄 Rebuild

Pour appliquer la correction :

```bash
# Reconstruire les services
docker-compose build

# Ou un service spécifique
docker-compose build auth
docker-compose build quiz
docker-compose build game
```

## 📋 Fichiers Modifiés

1. `node/auth-service/.dockerignore` - Exclut `shared` lors de la copie
2. `node/quiz-service/.dockerignore` - Exclut `shared` lors de la copie
3. `node/game-service/.dockerignore` - Exclut `shared` lors de la copie
4. `node/auth-service/Dockerfile` - Ajoute la gestion du lien symbolique
5. `node/quiz-service/Dockerfile` - Ajoute la gestion du lien symbolique
6. `node/game-service/Dockerfile` - Ajoute la gestion du lien symbolique

## ✅ Vérification

Après le rebuild, vérifiez que le build réussit :

```bash
docker-compose build auth
# Devrait se terminer sans erreur
```

## 💡 Note

Les liens symboliques sont utiles pour le développement local, mais dans Docker, on copie directement le vrai dossier `shared` pour éviter les problèmes de chemins.

