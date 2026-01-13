# Mettre à jour le token Telegram Bot dans Kubernetes

## Méthode 1 : Édition directe (recommandée)

```bash
kubectl edit secret telegram-bot-secret -n intelectgame
```

Dans l'éditeur qui s'ouvre :
1. Trouvez la ligne `TELEGRAM_BOT_TOKEN: <valeur_base64>`
2. Remplacez la valeur base64 par votre nouveau token encodé en base64
3. Pour encoder votre token en base64 : `echo -n "VOTRE_TOKEN" | base64`
4. Sauvegardez et quittez

## Méthode 2 : Commande directe (rapide)

```bash
# Remplacer YOUR_TELEGRAM_BOT_TOKEN par votre vrai token
kubectl create secret generic telegram-bot-secret \
  --from-literal=TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN" \
  -n intelectgame \
  --dry-run=client -o yaml | kubectl apply -f -
```

## Méthode 3 : Script interactif

Si le script existe :
```bash
./k8s/scripts/update-telegram-token.sh
```

## Méthode 4 : Mise à jour via base64

```bash
# Encoder votre token en base64
TOKEN_B64=$(echo -n "VOTRE_TOKEN_ICI" | base64)

# Mettre à jour le secret
kubectl patch secret telegram-bot-secret -n intelectgame \
  --type='json' \
  -p="[{\"op\": \"replace\", \"path\": \"/data/TELEGRAM_BOT_TOKEN\", \"value\": \"$TOKEN_B64\"}]"
```

## Après la mise à jour

Redémarrer le pod telegram-bot pour qu'il prenne en compte le nouveau token :

```bash
# Redémarrer le deployment
kubectl rollout restart deployment/telegram-bot -n intelectgame

# Vérifier les logs
kubectl logs -f -n intelectgame -l app=telegram-bot
```

## Vérification

Vérifier que le token a été mis à jour :

```bash
# Voir le token (décodé)
kubectl get secret telegram-bot-secret -n intelectgame \
  -o jsonpath='{.data.TELEGRAM_BOT_TOKEN}' | base64 -d
echo ""

# Voir les logs du bot pour confirmer
kubectl logs -n intelectgame -l app=telegram-bot | grep -i "token\|bot"
```


