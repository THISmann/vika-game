# Correction : Erreur 409 Conflict - Multiples instances du bot Telegram

## Problème

Le bot Telegram affiche l'erreur :
```
❌ Erreur de polling Telegram: ETELEGRAM: 409 Conflict: terminated by other getUpdates request; make sure that only one bot instance is running
```

Cette erreur se produit car **Telegram ne permet qu'une seule instance d'un bot à la fois** pour recevoir les mises à jour. Si plusieurs pods telegram-bot tournent simultanément, ils entrent en conflit.

## Cause

Plusieurs pods telegram-bot sont en cours d'exécution en même temps, probablement à cause de :
1. Un redéploiement qui a créé un nouveau pod sans terminer l'ancien
2. Le deployment configuré avec plus d'une réplique
3. Des pods en état "Terminating" qui traînent

## Solution

### Option 1 : Utiliser le script automatique (Recommandé)

```bash
# Sur la VM
./k8s/scripts/fix-telegram-bot-multiple-instances.sh
```

Ce script :
1. Identifie tous les pods telegram-bot
2. Garde seulement le plus récent
3. Supprime les pods en double
4. Nettoie les pods en état Terminating
5. S'assure que le deployment n'a qu'une seule réplique
6. Vérifie que tout fonctionne correctement

### Option 2 : Correction manuelle

```bash
# Sur la VM

# 1. Vérifier l'état des pods
kubectl get pods -n intelectgame -l app=telegram-bot

# 2. S'assurer que le deployment n'a qu'une seule réplique
kubectl scale deployment telegram-bot -n intelectgame --replicas=1

# 3. Supprimer tous les pods (Kubernetes les recréera automatiquement)
kubectl delete pods -n intelectgame -l app=telegram-bot

# 4. Attendre que le nouveau pod soit créé
kubectl get pods -n intelectgame -l app=telegram-bot -w
# Appuyez sur Ctrl+C quand un seul pod est en état "Running"

# 5. Vérifier les logs
kubectl logs -n intelectgame -l app=telegram-bot --tail=20
```

### Option 3 : Supprimer les pods en double manuellement

```bash
# Sur la VM

# 1. Lister tous les pods
kubectl get pods -n intelectgame -l app=telegram-bot

# 2. Identifier le pod le plus récent (celui avec l'AGE le plus petit)

# 3. Supprimer les autres pods
kubectl delete pod <pod-name-1> -n intelectgame --grace-period=0 --force
kubectl delete pod <pod-name-2> -n intelectgame --grace-period=0 --force

# 4. Vérifier qu'il n'y a plus qu'un seul pod
kubectl get pods -n intelectgame -l app=telegram-bot
```

## Vérification

Après la correction :

```bash
# Sur la VM

# 1. Vérifier qu'il n'y a qu'un seul pod
kubectl get pods -n intelectgame -l app=telegram-bot

# Devrait afficher un seul pod avec STATUS Running

# 2. Vérifier les logs
kubectl logs -n intelectgame -l app=telegram-bot --tail=20

# Ne devrait plus afficher: "❌ Erreur de polling Telegram: ETELEGRAM: 409 Conflict"
# Devrait afficher: "✅ Polling démarré avec succès" sans erreurs
```

## Configuration du deployment

Le deployment telegram-bot doit être configuré avec **1 seule réplique** :

```yaml
spec:
  replicas: 1  # IMPORTANT: Un seul pod pour éviter les conflits 409
```

Vérifiez la configuration :

```bash
# Sur la VM
kubectl get deployment telegram-bot -n intelectgame -o yaml | grep replicas
```

Si ce n'est pas 1, mettez à jour :

```bash
kubectl scale deployment telegram-bot -n intelectgame --replicas=1
```

## Pourquoi cela arrive

Telegram utilise un système de "long polling" où chaque bot doit avoir un seul point de connexion actif. Si plusieurs instances du même bot essaient de se connecter en même temps, Telegram retourne une erreur 409 Conflict.

C'est pourquoi il est **crucial** de n'avoir qu'**un seul pod telegram-bot** en cours d'exécution à la fois.

## Résumé

Le problème vient du fait que plusieurs pods telegram-bot tournent simultanément. La solution est de :

1. S'assurer que le deployment n'a qu'une seule réplique
2. Supprimer les pods en double
3. Nettoyer les pods en état Terminating

Une fois corrigé, le bot Telegram devrait fonctionner correctement sans erreur 409.

