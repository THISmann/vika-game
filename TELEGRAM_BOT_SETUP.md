# Configuration du Telegram Bot

## 🔒 Sécurité du Token

Le token du bot Telegram a été sécurisé et n'est plus stocké en dur dans le code.

### Secret GitHub

Le token `TELEGRAM_BOT_TOKEN` est configuré comme secret GitHub et est disponible pour :
- Les workflows GitHub Actions
- Les déploiements automatisés
- Les configurations CI/CD

**Note importante** : Le token n'est pas nécessaire pendant le build Docker, mais doit être fourni comme variable d'environnement au runtime du container.

## Modifications apportées

### 1. Code sécurisé
- ✅ Le token est maintenant lu uniquement depuis `process.env.TELEGRAM_BOT_TOKEN`
- ✅ Le token en dur a été supprimé du code
- ✅ Le service vérifie la présence du token au démarrage

### 2. Dockerfile mis à jour
- ✅ Utilise `npm install` au lieu de `npm ci` (plus flexible)
- ✅ Commentaire ajouté pour rappeler que le token doit être fourni

### 3. Pipeline GitHub Actions
- ✅ Le service telegram-bot est maintenant inclus dans le workflow
- ✅ L'image sera poussée vers DockerHub : `thismann17/gamev2-telegram-bot:latest`

## Configuration

### Développement Local

1. Créer un fichier `.env` dans `node/telegram-bot/` :

```bash
cd node/telegram-bot
cp env.example .env
```

2. Éditer `.env` et ajouter votre token :

```env
TELEGRAM_BOT_TOKEN=8430515537:AAEN0z00IegEl3aqyoGO1K8jBE8gj4E5jO4
```

3. Démarrer le service :

```bash
npm install
npm start
```

### Docker

```bash
docker run -e TELEGRAM_BOT_TOKEN=your_token_here \
  thismann17/gamev2-telegram-bot:latest
```

### Docker Compose

Le service est déjà configuré dans `docker-compose.yml`. Assurez-vous d'avoir un fichier `.env` dans `node/telegram-bot/` ou définissez la variable d'environnement :

```bash
export TELEGRAM_BOT_TOKEN=your_token_here
docker-compose up telegram-bot
```

## Images Docker

Après le prochain push, l'image sera disponible sur DockerHub :

- `thismann17/gamev2-telegram-bot:latest`
- `thismann17/gamev2-telegram-bot:main`
- `thismann17/gamev2-telegram-bot:main-<sha>`

## Utilisation du Secret GitHub

Le token `TELEGRAM_BOT_TOKEN` est configuré comme secret GitHub. Pour l'utiliser dans vos workflows ou déploiements :

### Dans un workflow GitHub Actions

```yaml
- name: Run Telegram Bot
  run: |
    docker run -d \
      --name telegram-bot \
      -e TELEGRAM_BOT_TOKEN="${{ secrets.TELEGRAM_BOT_TOKEN }}" \
      -e AUTH_SERVICE_URL=http://auth:3001 \
      -e QUIZ_SERVICE_URL=http://quiz:3002 \
      -e GAME_SERVICE_URL=http://game:3003 \
      thismann17/gamev2-telegram-bot:latest
```

### Dans Kubernetes

Créez un secret depuis le secret GitHub (via un workflow) :

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: telegram-bot-secret
type: Opaque
stringData:
  TELEGRAM_BOT_TOKEN: "${{ secrets.TELEGRAM_BOT_TOKEN }}"
```

### Vérification

Pour vérifier que le secret est bien configuré dans GitHub :
1. Allez dans **Settings** > **Secrets and variables** > **Actions**
2. Vous devriez voir `TELEGRAM_BOT_TOKEN` dans la liste des secrets

## Vérification

Le service affichera une erreur claire si le token est manquant :

```
TELEGRAM_BOT_TOKEN is required! Please set it as an environment variable.
For local development, create a .env file with: TELEGRAM_BOT_TOKEN=your_token_here
```

## Important

- ⚠️ **NE JAMAIS** committer le fichier `.env` avec le token réel
- ⚠️ Le fichier `.env` est déjà dans `.gitignore`
- ✅ Utilisez des secrets Kubernetes/Docker pour la production
- ✅ Utilisez le fichier `env.example` comme modèle

