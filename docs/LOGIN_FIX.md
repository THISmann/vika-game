# Fix: Problème de login - ERR_INCOMPLETE_CHUNKED_ENCODING

## Problème

Lors de la tentative de connexion sur `http://vika-game.ru/auth/login`, les erreurs suivantes apparaissaient :

1. `POST http://vika-game.ru/api/auth/users/login 400 (Bad Request)`
2. `ERR_INCOMPLETE_CHUNKED_ENCODING`
3. `Network Error`

## Cause

Le problème venait de la configuration de l'API Gateway qui ne gérait pas correctement le body JSON des requêtes POST. L'API Gateway utilisait `express.urlencoded()` mais pas `express.json()` pour parser le body JSON, ce qui causait des problèmes lors de la transmission des données au service auth.

## Solution

### Modifications apportées

1. **API Gateway (`node/api-gateway/server.js`)**:
   - Ajout d'un middleware conditionnel pour parser le JSON body uniquement pour les routes non-proxy
   - Pour les routes proxifiées, `http-proxy-middleware` gère automatiquement le body
   - Augmentation de la limite de taille du body à 10mb

2. **API Gateway Routes (`node/api-gateway/src/routes/gateway.routes.js`)**:
   - Ajout de la définition automatique du header `Content-Type: application/json` pour les requêtes POST/PUT/PATCH
   - Ajout de logging du body pour le débogage

3. **Auth Service (`node/auth-service/server.js`)**:
   - Augmentation de la limite de taille du body JSON à 10mb
   - Ajout du support pour `express.urlencoded()` avec limite de 10mb

## Déploiement

### Option 1: Script automatique

```bash
./deploy-login-fix.sh
```

### Option 2: Déploiement manuel

1. **Pousser les changements vers GitHub** (si pas déjà fait):
   ```bash
   git push origin main
   ```

2. **Se connecter au serveur**:
   ```bash
   ssh user1@82.202.141.248
   ```

3. **Récupérer les modifications**:
   ```bash
   cd ~/vika-game
   git pull origin main
   ```

4. **Reconstruire les conteneurs**:
   ```bash
   docker-compose build api-gateway auth
   ```

5. **Redémarrer les services**:
   ```bash
   docker-compose up -d api-gateway auth
   ```

6. **Vérifier les logs**:
   ```bash
   docker-compose logs --tail=50 api-gateway
   docker-compose logs --tail=50 auth
   ```

## Test

### Test avec curl

```bash
curl -X POST http://vika-game.ru/api/auth/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vika-game.com",
    "password": "admin"
  }'
```

### Test dans le navigateur

1. Ouvrir `http://vika-game.ru/auth/login`
2. Entrer les identifiants:
   - Email: `admin@vika-game.com`
   - Password: `admin`
3. Cliquer sur "Se connecter"

## Vérification

Si le problème persiste, vérifier :

1. **Logs de l'API Gateway**:
   ```bash
   docker-compose logs api-gateway | grep -i "auth/users/login"
   ```

2. **Logs du service Auth**:
   ```bash
   docker-compose logs auth | grep -i "users/login"
   ```

3. **État des conteneurs**:
   ```bash
   docker-compose ps api-gateway auth
   ```

4. **Test de connectivité**:
   ```bash
   curl http://vika-game.ru/api/auth/health
   ```

## Notes

- L'erreur `ERR_INCOMPLETE_CHUNKED_ENCODING` indiquait que la réponse HTTP était tronquée, probablement due à un problème de proxy ou de timeout
- Les modifications garantissent que le body JSON est correctement transmis du frontend → Traefik → API Gateway → Auth Service
- La limite de 10mb permet de gérer les futures uploads de fichiers si nécessaire
