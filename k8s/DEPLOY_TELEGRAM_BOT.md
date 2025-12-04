# 🤖 Guide de Déploiement du Bot Telegram

## Configuration du Token depuis GitHub Secrets

### Option 1: Déploiement Manuel (Recommandé pour la première fois)

1. **Obtenir le token depuis GitHub Secrets**:
   - Aller sur GitHub → Settings → Secrets and variables → Actions
   - Copier la valeur de `TELEGRAM_BOT_TOKEN`

2. **Créer le secret Kubernetes**:
   ```bash
   # Sur votre machine locale (avec accès à kubectl)
   export TELEGRAM_BOT_TOKEN="votre_token_ici"
   ./k8s/update-telegram-secret.sh
   ```

   Ou manuellement:
   ```bash
   kubectl create secret generic telegram-bot-secret \
     --from-literal=TELEGRAM_BOT_TOKEN="votre_token_ici" \
     --namespace=intelectgame
   ```

### Option 2: Déploiement Automatique via GitHub Actions

Créer un workflow GitHub Actions pour déployer automatiquement le secret:

```yaml
# .github/workflows/deploy-telegram-secret.yml
name: Deploy Telegram Bot Secret

on:
  workflow_dispatch:
    inputs:
      kubeconfig:
        description: 'Kubeconfig (base64 encoded)'
        required: true

jobs:
  deploy-secret:
    runs-on: ubuntu-latest
    steps:
      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
      
      - name: Configure kubectl
        run: |
          echo "${{ inputs.kubeconfig }}" | base64 -d > $HOME/.kube/config
      
      - name: Create Telegram Bot Secret
        run: |
          kubectl create secret generic telegram-bot-secret \
            --from-literal=TELEGRAM_BOT_TOKEN="${{ secrets.TELEGRAM_BOT_TOKEN }}" \
            --namespace=intelectgame \
            --dry-run=client -o yaml | kubectl apply -f -
```

## Déploiement du Bot

```bash
# 1. S'assurer que le secret existe
kubectl get secret telegram-bot-secret -n intelectgame

# 2. Déployer le bot
kubectl apply -f k8s/all-services.yaml

# 3. Vérifier le statut
kubectl get pods -n intelectgame | grep telegram-bot

# 4. Voir les logs
kubectl logs -f deployment/telegram-bot -n intelectgame
```

## Test du Bot

1. Ouvrir Telegram
2. Chercher votre bot (nom donné lors de la création avec BotFather)
3. Cliquer sur "Start"
4. Le bot devrait demander le code du jeu

## Vérification

```bash
# Vérifier que le token est correct
kubectl get secret telegram-bot-secret -n intelectgame -o jsonpath='{.data.TELEGRAM_BOT_TOKEN}' | base64 -d

# Vérifier les logs pour les erreurs
kubectl logs deployment/telegram-bot -n intelectgame | grep -i error

# Vérifier la connexion WebSocket
kubectl logs deployment/telegram-bot -n intelectgame | grep "WebSocket"
```

