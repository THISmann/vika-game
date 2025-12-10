# Nettoyage des anciens pods quiz-service

## Problème

Après avoir appliqué la correction du deployment, certains pods quiz-service n'ont toujours pas la variable d'environnement `AUTH_SERVICE_URL`. Ce sont des anciens pods qui ont été créés avant la mise à jour du deployment.

## Solution

### Option 1 : Utiliser le script automatique (Recommandé)

```bash
# Sur la VM
./k8s/scripts/cleanup-old-quiz-pods.sh
```

Ce script :
1. Identifie tous les pods quiz-service
2. Vérifie lesquels n'ont pas `AUTH_SERVICE_URL`
3. Supprime les pods sans la variable
4. Vérifie que les nouveaux pods ont la variable correcte

### Option 2 : Suppression manuelle

```bash
# Sur la VM
# 1. Lister tous les pods quiz-service
kubectl get pods -n intelectgame -l app=quiz-service

# 2. Vérifier quels pods n'ont pas AUTH_SERVICE_URL
for POD in $(kubectl get pods -n intelectgame -l app=quiz-service -o jsonpath='{.items[*].metadata.name}'); do
  echo "Pod: $POD"
  kubectl exec -n intelectgame $POD -- env | grep AUTH_SERVICE_URL || echo "  ❌ AUTH_SERVICE_URL non trouvé"
done

# 3. Supprimer les pods sans AUTH_SERVICE_URL
kubectl delete pod <pod-name> -n intelectgame --grace-period=0 --force
```

### Option 3 : Suppression de tous les pods (plus simple)

```bash
# Sur la VM
# Supprimer tous les pods quiz-service - Kubernetes les recréera automatiquement avec la bonne configuration
kubectl delete pods -n intelectgame -l app=quiz-service

# Attendre que les nouveaux pods soient créés
kubectl get pods -n intelectgame -l app=quiz-service -w
# Appuyez sur Ctrl+C quand tous les pods sont en état "Running"
```

## Vérification

Après le nettoyage :

```bash
# Sur la VM
QUIZ_PODS=$(kubectl get pods -n intelectgame -l app=quiz-service -o jsonpath='{.items[*].metadata.name}')
for POD in $QUIZ_PODS; do
  echo "Pod: $POD"
  kubectl exec -n intelectgame $POD -- env | grep AUTH_SERVICE_URL
done
```

Tous les pods devraient afficher : `AUTH_SERVICE_URL=http://auth-service:3001`

## Pourquoi cela arrive

Lors d'un `kubectl rollout restart`, Kubernetes crée de nouveaux pods avec la nouvelle configuration, mais les anciens pods peuvent rester en cours d'exécution pendant un certain temps (grace period). Si les anciens pods ont été créés avant la mise à jour du deployment, ils n'auront pas la variable d'environnement.

## Résumé

Les anciens pods quiz-service doivent être supprimés manuellement pour qu'ils soient recréés avec la bonne configuration. Le script `cleanup-old-quiz-pods.sh` automatise ce processus.

Une fois les anciens pods supprimés, tous les pods quiz-service devraient avoir `AUTH_SERVICE_URL=http://auth-service:3001` et pouvoir se connecter à l'auth-service.

