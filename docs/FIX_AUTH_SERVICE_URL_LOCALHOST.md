# Correction : AUTH_SERVICE_URL utilise localhost au lieu de auth-service

## Problème

Les logs du quiz-service montrent :
```
🔐 AUTH_SERVICE_URL: http://localhost:3001
❌ Error: connect ECONNREFUSED ::1:3001
```

Le quiz-service essaie de se connecter à `localhost:3001` au lieu de `auth-service:3001`, ce qui échoue car dans Kubernetes, les services doivent utiliser les noms de service DNS.

## Cause

La variable d'environnement `AUTH_SERVICE_URL` n'est pas correctement injectée dans les pods quiz-service, donc le code utilise la valeur par défaut `http://localhost:3001`.

## Solution

### 1. Vérifier le ConfigMap

```bash
# Sur la VM
kubectl get configmap app-config -n intelectgame -o yaml | grep AUTH_SERVICE_URL
```

Devrait afficher : `AUTH_SERVICE_URL: "http://auth-service:3001"`

### 2. Appliquer le script de correction

```bash
# Sur la VM
./k8s/scripts/fix-quiz-service-auth-url.sh
```

Ce script :
1. Vérifie le ConfigMap
2. Vérifie les variables d'environnement dans les pods
3. Applique le ConfigMap si nécessaire
4. Redémarre les pods quiz-service
5. Vérifie que la variable est correctement injectée

### 3. Vérification manuelle

```bash
# Sur la VM
# Vérifier les variables d'environnement dans un pod quiz-service
QUIZ_POD=$(kubectl get pods -n intelectgame -l app=quiz-service -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n intelectgame $QUIZ_POD -- env | grep AUTH_SERVICE_URL
```

Devrait afficher : `AUTH_SERVICE_URL=http://auth-service:3001`

### 4. Si le problème persiste

#### Option A : Supprimer et recréer les pods

```bash
# Sur la VM
kubectl delete pods -n intelectgame -l app=quiz-service
# Les pods seront automatiquement recréés par le deployment
```

#### Option B : Vérifier que le deployment référence le ConfigMap

```bash
# Sur la VM
kubectl get deployment quiz-service -n intelectgame -o yaml | grep -A 5 "AUTH_SERVICE_URL"
```

Devrait montrer :
```yaml
- name: AUTH_SERVICE_URL
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: AUTH_SERVICE_URL
```

#### Option C : Recréer le ConfigMap

```bash
# Sur la VM
kubectl apply -f k8s/configmap.yaml -n intelectgame
kubectl rollout restart deployment/quiz-service -n intelectgame
```

## Vérification après correction

Après avoir appliqué la correction, les logs du quiz-service devraient montrer :
```
🔐 AUTH_SERVICE_URL: http://auth-service:3001
🔐 Calling auth service: http://auth-service:3001/auth/verify-token
✅ Token verified successfully
```

Au lieu de :
```
🔐 AUTH_SERVICE_URL: http://localhost:3001
❌ Error: connect ECONNREFUSED ::1:3001
```

## Résumé

Le problème vient du fait que la variable d'environnement `AUTH_SERVICE_URL` n'est pas injectée dans les pods quiz-service. La solution est de :
1. Vérifier que le ConfigMap contient la bonne valeur
2. Vérifier que le deployment référence le ConfigMap
3. Redémarrer les pods pour qu'ils prennent la nouvelle configuration

Une fois corrigé, le quiz-service pourra se connecter à l'auth-service et vérifier les tokens correctement.

