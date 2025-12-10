# Correction : Variable d'environnement AUTH_SERVICE_URL manquante dans quiz-service

## Problème

Les pods quiz-service n'ont pas la variable d'environnement `AUTH_SERVICE_URL` injectée, même si :
- ✅ Le ConfigMap contient la bonne valeur : `http://auth-service:3001`
- ✅ Le fichier `k8s/quiz-service-deployment.yaml` référence le ConfigMap

Le deployment actuel sur la VM ne contient pas la référence à `AUTH_SERVICE_URL`.

## Solution

### Option 1 : Appliquer le deployment corrigé (Recommandé)

```bash
# Sur la VM
kubectl apply -f k8s/quiz-service-deployment.yaml -n intelectgame
kubectl rollout restart deployment/quiz-service -n intelectgame
kubectl rollout status deployment/quiz-service -n intelectgame --timeout=120s
```

### Option 2 : Utiliser le script automatique

```bash
# Sur la VM
./k8s/scripts/apply-quiz-service-fix.sh
```

### Option 3 : Correction manuelle via kubectl

```bash
# Sur la VM
# 1. Obtenir le deployment actuel
kubectl get deployment quiz-service -n intelectgame -o yaml > quiz-service-deployment-current.yaml

# 2. Ajouter la variable d'environnement AUTH_SERVICE_URL dans la section env
# (Éditer le fichier pour ajouter la section manquante)

# 3. Appliquer le deployment modifié
kubectl apply -f quiz-service-deployment-current.yaml -n intelectgame

# 4. Redémarrer les pods
kubectl rollout restart deployment/quiz-service -n intelectgame
```

## Vérification

Après avoir appliqué la correction :

```bash
# Sur la VM
QUIZ_POD=$(kubectl get pods -n intelectgame -l app=quiz-service -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n intelectgame $QUIZ_POD -- env | grep AUTH_SERVICE_URL
```

Devrait afficher : `AUTH_SERVICE_URL=http://auth-service:3001`

## Structure attendue du deployment

Le deployment doit contenir dans la section `env` :

```yaml
env:
- name: AUTH_SERVICE_URL
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: AUTH_SERVICE_URL
```

## Pourquoi cela arrive

Le deployment sur la VM a été créé avant que la variable `AUTH_SERVICE_URL` ne soit ajoutée au fichier de configuration, ou le deployment a été modifié manuellement sans inclure cette variable.

## Résumé

Le problème vient du fait que le deployment quiz-service sur la VM ne référence pas `AUTH_SERVICE_URL` dans le ConfigMap. La solution est d'appliquer le fichier `k8s/quiz-service-deployment.yaml` qui contient la configuration correcte, puis de redémarrer les pods.

Une fois corrigé, les pods quiz-service auront accès à `AUTH_SERVICE_URL=http://auth-service:3001` et pourront se connecter à l'auth-service pour vérifier les tokens.

