# Correction du script build-local-images.sh

## Problème

Le script `build-local-images.sh` tentait de construire les images Docker depuis le mauvais contexte, causant des erreurs comme :
```
ERROR: failed to build: failed to solve: "/auth-service/token.js": not found
```

## Causes

1. **Mauvais contexte de build** : Le script exécutait `docker build` depuis `node/auth-service/` alors que les Dockerfiles s'attendent à être exécutés depuis `node/` (pour accéder à `shared` et `auth-service/`).

2. **Fichier inutile** : Le Dockerfile de `auth-service` tentait de copier `token.js` à la racine, mais ce fichier est vide et n'est pas utilisé (le code utilise `utils/token.js`).

## Corrections appliquées

### 1. Correction du script `build-local-images.sh`

**Avant** :
```bash
cd node/auth-service
docker build -t gamev2-auth-service:local -f Dockerfile .
```

**Après** :
```bash
cd node
docker build -t gamev2-auth-service:local -f auth-service/Dockerfile .
```

Le contexte de build est maintenant `node/` au lieu de `node/auth-service/`, ce qui permet d'accéder à :
- `shared/` (répertoire partagé)
- `auth-service/`, `quiz-service/`, `game-service/` (répertoires des services)

### 2. Suppression de la ligne inutile dans `node/auth-service/Dockerfile`

**Avant** :
```dockerfile
COPY auth-service/server.js ./
COPY auth-service/token.js ./  # ← Fichier vide et inutilisé
EXPOSE 3001
```

**Après** :
```dockerfile
COPY auth-service/server.js ./
EXPOSE 3001
```

## Résultat

Le script `build-local-images.sh` peut maintenant construire toutes les images Docker localement pour Minikube sans erreur.

## Utilisation

```bash
# Depuis la racine du projet
./k8s/local/scripts/build-local-images.sh
```

Les images seront construites et chargées dans le daemon Docker de Minikube.


