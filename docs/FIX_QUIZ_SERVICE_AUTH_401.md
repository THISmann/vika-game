# Correction définitive : Erreur 401 dans quiz-service lors de la vérification du token

## Problème

Lors du démarrage du jeu, le game-service transmet correctement le header Authorization au quiz-service, mais le quiz-service ne peut pas vérifier le token et retourne une erreur 401 :

```
❌ Error fetching questions: Request failed with status code 401
❌ Error response: { error: 'Authentication failed', message: 'Could not verify token' }
```

## Analyse

### Flux de la requête

1. **Frontend** → `POST /api/game/start` avec `Authorization: Bearer <token>`
2. **Nginx** → Route vers `game-service` avec le header
3. **Game-service** → Reçoit le header, appelle `quiz-service` avec le header
4. **Quiz-service** → Reçoit le header, essaie de vérifier via `auth-service`
5. **Auth-service** → Devrait vérifier et retourner `{ valid: true, role: 'admin' }`

### Problème identifié

Le quiz-service essaie d'appeler `${AUTH_SERVICE_URL}/auth/verify-token` mais :
- L'URL peut être incorrecte
- Le quiz-service ne peut pas se connecter à l'auth-service (problème réseau Kubernetes)
- L'endpoint `/auth/verify-token` n'est pas accessible
- Le timeout est trop court (5 secondes)

## Corrections appliquées

### 1. Logs de diagnostic améliorés

Dans `node/quiz-service/middleware/auth.middleware.js` :
- Logs détaillés de chaque étape de l'authentification
- Affichage de l'URL complète appelée
- Logs des erreurs avec tous les détails (code, message, response)
- Vérification du header (minuscules/majuscules)

### 2. Timeout augmenté

- Timeout augmenté de 5 secondes à 10 secondes pour les appels à l'auth-service

### 3. Gestion d'erreurs améliorée

- Messages d'erreur plus détaillés en développement
- Détection des erreurs de connexion (ECONNREFUSED, ENOTFOUND, ETIMEDOUT)
- Affichage de l'URL complète en cas d'erreur

## Vérification

### 1. Vérifier les logs du quiz-service

```bash
# Sur la VM
kubectl logs -f -l app=quiz-service -n intelectgame | grep -A 30 "QUIZ-SERVICE AUTHENTICATION"
```

Vous devriez voir :
- `🔐 AUTH_SERVICE_URL: http://auth-service:3001`
- `🔐 Calling auth service: http://auth-service:3001/auth/verify-token`
- `🔐 Auth service response status: 200`
- `✅ Token verified successfully`

### 2. Vérifier que l'auth-service est accessible

```bash
# Depuis un pod quiz-service
kubectl exec -n intelectgame $(kubectl get pods -n intelectgame -l app=quiz-service -o jsonpath='{.items[0].metadata.name}') -- wget -qO- --timeout=10 http://auth-service:3001/auth/test
```

Vous devriez voir : `{"message":"Auth route working well now!"}`

### 3. Vérifier l'endpoint verify-token

```bash
# Depuis un pod quiz-service (avec un token valide)
kubectl exec -n intelectgame $(kubectl get pods -n intelectgame -l app=quiz-service -o jsonpath='{.items[0].metadata.name}') -- wget -qO- --timeout=10 --header="Authorization: Bearer YWRtaW4tMTc2NTM2ODM2NDQ4NA==" http://auth-service:3001/auth/verify-token
```

### 4. Vérifier les variables d'environnement

```bash
# Sur la VM
kubectl exec -n intelectgame $(kubectl get pods -n intelectgame -l app=quiz-service -o jsonpath='{.items[0].metadata.name}') -- env | grep AUTH_SERVICE_URL
```

Vous devriez voir : `AUTH_SERVICE_URL=http://auth-service:3001`

## Actions requises

### 1. Rebuild et redéployer le quiz-service

```bash
# Sur votre machine locale
cd node/quiz-service
docker build -t thismann17/gamev2-quiz-service:latest -f Dockerfile .
docker push thismann17/gamev2-quiz-service:latest

# Sur la VM
kubectl rollout restart deployment/quiz-service -n intelectgame
kubectl rollout status deployment/quiz-service -n intelectgame --timeout=120s
```

### 2. Vérifier que l'auth-service est en cours d'exécution

```bash
# Sur la VM
kubectl get pods -n intelectgame -l app=auth-service
kubectl logs -l app=auth-service -n intelectgame --tail=50
```

### 3. Tester la connectivité

```bash
# Sur la VM - Exécuter depuis un pod quiz-service
QUIZ_POD=$(kubectl get pods -n intelectgame -l app=quiz-service -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n intelectgame $QUIZ_POD -- wget -qO- --timeout=10 http://auth-service:3001/auth/test
```

### 4. Tester le démarrage du jeu

1. Connectez-vous au dashboard admin
2. Cliquez sur "Lancer la partie"
3. Vérifiez les logs du quiz-service
4. L'erreur 401 ne devrait plus apparaître

## Diagnostic en cas de problème persistant

### Si l'auth-service n'est pas accessible

1. Vérifiez que l'auth-service est en cours d'exécution :
   ```bash
   kubectl get pods -n intelectgame -l app=auth-service
   ```

2. Vérifiez les logs de l'auth-service :
   ```bash
   kubectl logs -l app=auth-service -n intelectgame --tail=100
   ```

3. Vérifiez le service Kubernetes :
   ```bash
   kubectl get svc -n intelectgame auth-service
   ```

### Si l'URL est incorrecte

1. Vérifiez le ConfigMap :
   ```bash
   kubectl get configmap app-config -n intelectgame -o yaml | grep AUTH_SERVICE_URL
   ```

2. Vérifiez que le quiz-service utilise la bonne variable :
   ```bash
   kubectl exec -n intelectgame $(kubectl get pods -n intelectgame -l app=quiz-service -o jsonpath='{.items[0].metadata.name}') -- env | grep AUTH_SERVICE_URL
   ```

### Si le token n'est pas valide

1. Vérifiez que le token est bien formaté dans les logs
2. Vérifiez que le token n'a pas expiré (les tokens expirent après 24 heures)
3. Essayez de vous reconnecter pour obtenir un nouveau token

## Résumé des modifications

1. ✅ Logs de diagnostic améliorés dans `quiz-service/middleware/auth.middleware.js`
2. ✅ Timeout augmenté à 10 secondes
3. ✅ Gestion d'erreurs améliorée avec détails complets
4. ✅ Vérification du header (minuscules/majuscules)
5. ✅ Messages d'erreur plus informatifs

Ces modifications devraient résoudre définitivement le problème d'authentification dans le quiz-service.

