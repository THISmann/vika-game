# GitHub Actions Workflows

## Docker Build and Push

Ce workflow construit et pousse automatiquement les images Docker vers DockerHub.

### Configuration requise

Pour que ce workflow fonctionne, vous devez configurer les secrets suivants dans votre repository GitHub :

1. Allez dans **Settings** > **Secrets and variables** > **Actions**
2. Ajoutez les secrets suivants :

   - **DOCKER_USERNAME** : `thismann17` (votre nom d'utilisateur DockerHub)
   - **DOCKER_PASSWORD** : Votre mot de passe DockerHub ou un Personal Access Token (recommandé)

### Utilisation d'un Personal Access Token (recommandé)

Pour plus de sécurité, utilisez un Personal Access Token au lieu de votre mot de passe :

1. Allez sur https://hub.docker.com/settings/security
2. Cliquez sur **New Access Token**
3. Donnez un nom au token (ex: "github-actions")
4. Copiez le token généré
5. Ajoutez-le comme secret `DOCKER_PASSWORD` dans GitHub

### Déclencheurs

Le workflow se déclenche automatiquement sur :
- Push vers les branches `main` ou `master`
- Push de tags (ex: `v1.0.0`)
- Pull requests vers `main` ou `master` (build uniquement, pas de push)
- Déclenchement manuel via l'interface GitHub Actions

### Images créées

Le workflow crée et pousse 4 images Docker :

1. `thismann17/gamev2-auth-service`
2. `thismann17/gamev2-quiz-service`
3. `thismann17/gamev2-game-service`
4. `thismann17/gamev2-frontend`

### Tags

Les images sont taguées avec :
- `latest` : Pour la branche par défaut
- Nom de la branche : Pour les autres branches
- SHA du commit : Pour le traçage
- Version semver : Si vous poussez un tag (ex: `v1.0.0`)

### Utilisation des images

Après le push, vous pouvez utiliser les images avec :

```bash
docker pull thismann17/gamev2-auth-service:latest
docker pull thismann17/gamev2-quiz-service:latest
docker pull thismann17/gamev2-game-service:latest
docker pull thismann17/gamev2-frontend:latest
```

Ou dans un `docker-compose.yml` :

```yaml
services:
  auth:
    image: thismann17/gamev2-auth-service:latest
  quiz:
    image: thismann17/gamev2-quiz-service:latest
  game:
    image: thismann17/gamev2-game-service:latest
  frontend:
    image: thismann17/gamev2-frontend:latest
```

