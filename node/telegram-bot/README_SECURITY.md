# Sécurité du Token Telegram Bot

## ⚠️ Important : Protection du Token

Le token du bot Telegram est maintenant sécurisé et ne doit **JAMAIS** être stocké en dur dans le code.

## Configuration

### Développement Local

1. Créer un fichier `.env` dans le dossier `node/telegram-bot/` :

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
AUTH_SERVICE_URL=http://localhost:3001
QUIZ_SERVICE_URL=http://localhost:3002
GAME_SERVICE_URL=http://localhost:3003
GAME_WS_URL=http://localhost:3003
```

2. Le fichier `.env` est automatiquement ignoré par Git (déjà dans `.gitignore`)

### Docker

Lors du déploiement avec Docker, passez le token comme variable d'environnement :

```bash
docker run -e TELEGRAM_BOT_TOKEN=your_token_here \
  -e AUTH_SERVICE_URL=http://auth:3001 \
  -e QUIZ_SERVICE_URL=http://quiz:3002 \
  -e GAME_SERVICE_URL=http://game:3003 \
  thismann17/gamev2-telegram-bot:latest
```

### Docker Compose

Dans votre `docker-compose.yml` :

```yaml
telegram-bot:
  image: thismann17/gamev2-telegram-bot:latest
  environment:
    - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
    - AUTH_SERVICE_URL=http://auth:3001
    - QUIZ_SERVICE_URL=http://quiz:3002
    - GAME_SERVICE_URL=http://game:3003
  env_file:
    - .env  # Optionnel : charger depuis un fichier .env
```

### Kubernetes

Utilisez un Secret Kubernetes :

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: telegram-bot-secret
type: Opaque
stringData:
  TELEGRAM_BOT_TOKEN: "your_token_here"
```

Puis dans votre deployment :

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: telegram-bot
spec:
  template:
    spec:
      containers:
      - name: telegram-bot
        image: thismann17/gamev2-telegram-bot:latest
        env:
        - name: TELEGRAM_BOT_TOKEN
          valueFrom:
            secretKeyRef:
              name: telegram-bot-secret
              key: TELEGRAM_BOT_TOKEN
```

## Obtention d'un Token Telegram Bot

1. Ouvrir Telegram et chercher `@BotFather`
2. Envoyer `/newbot`
3. Suivre les instructions pour créer le bot
4. Copier le token reçu
5. **NE JAMAIS COMMITTER LE TOKEN DANS LE CODE**

## Vérification

Le service vérifie que le token est présent au démarrage. Si le token est manquant, le service s'arrêtera avec un message d'erreur clair.

## Sécurité

- ✅ Le token est lu uniquement depuis les variables d'environnement
- ✅ Le fichier `.env` est ignoré par Git
- ✅ Aucun token n'est stocké dans le code source
- ✅ Le token peut être géré via des secrets Kubernetes/Docker









