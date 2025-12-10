# ⚠️ IMPORTANT : Rebuild du frontend requis

## Problème

Les erreurs 404 (`/api/game/game/start`, `/api/quiz/quiz/all`) indiquent que l'image Docker du frontend n'a **PAS** été rebuild avec les dernières modifications du code.

## Cause

Les variables d'environnement Vite (`VITE_*`) sont injectées au **moment du build**, pas au runtime. Si vous modifiez le code source mais ne rebuild pas l'image Docker, les anciennes URLs sont toujours utilisées.

## Solution : Rebuild complet

### 1. Sur votre machine locale

```bash
# Aller dans le dossier vue
cd vue

# Rebuild l'image avec les nouvelles valeurs par défaut
docker build -t thismann17/gamev2-frontend:latest -f Dockerfile .

# Push l'image vers Docker Hub
docker push thismann17/gamev2-frontend:latest
```

### 2. Sur votre VM (Kubernetes)

```bash
# Forcer le redéploiement avec la nouvelle image
kubectl rollout restart deployment/frontend -n intelectgame

# Attendre que le déploiement soit terminé
kubectl rollout status deployment/frontend -n intelectgame --timeout=120s

# Vérifier que les nouveaux pods sont prêts
kubectl get pods -n intelectgame -l app=frontend
```

### 3. Vérifier que la nouvelle image est utilisée

```bash
# Vérifier l'image utilisée
kubectl get deployment frontend -n intelectgame -o jsonpath='{.spec.template.spec.containers[0].image}'

# Devrait afficher: thismann17/gamev2-frontend:latest

# Vérifier l'âge des pods (devraient être récents)
kubectl get pods -n intelectgame -l app=frontend -o wide
```

## Modifications qui nécessitent un rebuild

Toutes ces modifications nécessitent un rebuild :

1. ✅ **Dockerfile** : Valeurs par défaut changées de `http://localhost:3000` à `/api/auth`
2. ✅ **api.js** : Utilisation de `API_URLS` au lieu de construction manuelle
3. ✅ **config/api.js** : Logique de construction des URLs pour production

## Vérification après rebuild

### 1. Vérifier les URLs dans la console du navigateur

Ouvrez la console (F12) et exécutez :

```javascript
import { API_URLS, API_CONFIG } from '@/config/api'
console.log('AUTH_SERVICE:', API_CONFIG.AUTH_SERVICE)
console.log('QUIZ_SERVICE:', API_CONFIG.QUIZ_SERVICE)
console.log('GAME_SERVICE:', API_CONFIG.GAME_SERVICE)
console.log('Login URL:', API_URLS.auth.login)
console.log('Quiz all URL:', API_URLS.quiz.all)
console.log('Game start URL:', API_URLS.game.start)
```

**En production, vous devriez voir** :
```
AUTH_SERVICE: /api/auth
QUIZ_SERVICE: /api/quiz
GAME_SERVICE: /api/game
Login URL: /api/auth/admin/login
Quiz all URL: /api/quiz/all
Game start URL: /api/game/start
```

**Si vous voyez encore** :
```
Game start URL: /api/game/game/start  ❌
```

Cela signifie que l'image n'a pas été rebuild correctement.

### 2. Tester les fonctionnalités

1. **Connexion admin** : `/admin/login` → devrait fonctionner
2. **Charger les questions** : Dashboard admin → devrait charger sans 404
3. **Démarrer le jeu** : Dashboard admin → devrait fonctionner sans 404
4. **Supprimer une question** : Page questions → devrait fonctionner sans 404

## Si le problème persiste après rebuild

### 1. Vérifier le cache Docker

```bash
# Nettoyer le cache Docker
docker system prune -a

# Rebuild sans cache
docker build --no-cache -t thismann17/gamev2-frontend:latest -f vue/Dockerfile .
docker push thismann17/gamev2-frontend:latest
```

### 2. Forcer le pull de la nouvelle image

```bash
# Supprimer les pods pour forcer le pull
kubectl delete pods -n intelectgame -l app=frontend

# Attendre que les nouveaux pods soient créés
kubectl get pods -n intelectgame -l app=frontend -w
```

### 3. Vérifier les logs du build

Si les URLs sont toujours incorrectes, vérifiez les logs du build Docker pour voir quelles variables d'environnement ont été utilisées.

## Note importante

**Les variables d'environnement Kubernetes (`VITE_AUTH_SERVICE_URL`, etc.) dans le deployment ne sont PAS utilisées** car Vite remplace `import.meta.env.VITE_*` au moment du build, pas au runtime.

Si vous voulez changer les URLs après le build, vous devez :
1. Modifier les valeurs par défaut dans le Dockerfile
2. Rebuild l'image
3. Redéployer

