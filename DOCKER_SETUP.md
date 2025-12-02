# Configuration Docker et GitHub Actions

## Configuration des secrets GitHub

Pour que le workflow GitHub Actions fonctionne, vous devez configurer les secrets suivants :

### Étape 1 : Accéder aux secrets

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings**
3. Dans le menu de gauche, cliquez sur **Secrets and variables** > **Actions**
4. Cliquez sur **New repository secret**

### Étape 2 : Ajouter DOCKER_USERNAME

- **Name** : `DOCKER_USERNAME`
- **Value** : `thismann17`
- Cliquez sur **Add secret**

### Étape 3 : Ajouter DOCKER_PASSWORD

Vous avez deux options :

#### Option A : Utiliser votre mot de passe DockerHub (non recommandé)

- **Name** : `DOCKER_PASSWORD`
- **Value** : Votre mot de passe DockerHub
- Cliquez sur **Add secret**

#### Option B : Utiliser un Personal Access Token (recommandé)

1. Allez sur https://hub.docker.com/settings/security
2. Cliquez sur **New Access Token**
3. Donnez un nom au token (ex: "github-actions-gamev2")
4. Sélectionnez les permissions : **Read, Write, Delete**
5. Cliquez sur **Generate**
6. **Copiez le token** (vous ne pourrez plus le voir après)
7. Dans GitHub, créez un secret :
   - **Name** : `DOCKER_PASSWORD`
   - **Value** : Le token que vous venez de copier
   - Cliquez sur **Add secret**

## Vérification

Une fois les secrets configurés, le workflow se déclenchera automatiquement lors d'un push vers `main` ou `master`.

Vous pouvez vérifier l'état du workflow dans l'onglet **Actions** de votre repository GitHub.

## Images Docker créées

Après un push réussi, les images suivantes seront disponibles sur DockerHub :

- `thismann17/gamev2-auth-service:latest`
- `thismann17/gamev2-quiz-service:latest`
- `thismann17/gamev2-game-service:latest`
- `thismann17/gamev2-frontend:latest`

## Test local

Pour tester la construction des images localement :

```bash
# Auth service
docker build -t thismann17/gamev2-auth-service:latest ./node/auth-service

# Quiz service
docker build -t thismann17/gamev2-quiz-service:latest ./node/quiz-service

# Game service
docker build -t thismann17/gamev2-game-service:latest ./node/game-service

# Frontend
docker build -t thismann17/gamev2-frontend:latest ./vue
```

Pour pousser manuellement (après connexion) :

```bash
docker login -u thismann17
docker push thismann17/gamev2-auth-service:latest
docker push thismann17/gamev2-quiz-service:latest
docker push thismann17/gamev2-game-service:latest
docker push thismann17/gamev2-frontend:latest
```

