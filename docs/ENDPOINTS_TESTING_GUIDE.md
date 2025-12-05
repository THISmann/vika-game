# Guide de test des endpoints

## 🧪 Scripts de test

### 1. Test rapide (`test-all-endpoints.sh`)

Teste tous les endpoints et affiche un résumé :

```bash
# Test sur localhost
./test-all-endpoints.sh

# Test sur le serveur distant
./test-all-endpoints.sh http://82.202.141.248
```

**Résultat** : Affiche ✅ ou ❌ pour chaque endpoint avec le code HTTP

### 2. Test détaillé (`test-endpoints-detailed.sh`)

Teste les endpoints avec affichage complet des réponses :

```bash
# Test sur localhost
./test-endpoints-detailed.sh

# Test sur le serveur distant
./test-endpoints-detailed.sh http://82.202.141.248
```

**Résultat** : Affiche la requête, le status HTTP et la réponse complète

### 3. Vérification des logs (`check-service-logs.sh`)

Vérifie les logs des services pour diagnostiquer les erreurs :

```bash
# Vérifier les logs dans le namespace par défaut
./check-service-logs.sh

# Vérifier dans un namespace spécifique
./check-service-logs.sh intelectgame
```

**Résultat** : Affiche les erreurs récentes et les connexions MongoDB

## 📋 Endpoints testés

### Auth Service (`/api/auth`)

- ✅ `POST /auth/admin/login` - Connexion admin
- ✅ `POST /auth/players/register` - Inscription joueur
- ✅ `GET /auth/players` - Liste des joueurs
- ✅ `GET /auth/players/:id` - Détails d'un joueur

### Quiz Service (`/api/quiz`)

- ✅ `GET /quiz/questions` - Liste des questions (sans réponses)
- ✅ `GET /quiz/full` - Liste complète (avec réponses)
- ✅ `POST /quiz/create` - Créer une question
- ✅ `PUT /quiz/:id` - Modifier une question
- ✅ `DELETE /quiz/:id` - Supprimer une question

### Game Service (`/api/game`)

- ✅ `GET /game/state` - État du jeu
- ✅ `GET /game/code` - Code de jeu
- ✅ `GET /game/players/count` - Nombre de joueurs connectés
- ✅ `GET /game/leaderboard` - Classement
- ✅ `GET /game/results` - Résultats des questions
- ✅ `GET /game/score/:playerId` - Score d'un joueur
- ✅ `POST /game/answer` - Répondre à une question
- ✅ `POST /game/start` - Démarrer le jeu
- ✅ `POST /game/next` - Question suivante
- ✅ `POST /game/end` - Terminer le jeu

## 🔍 Diagnostic des erreurs

### Erreur 500 sur `/api/quiz/create`

1. **Vérifier les logs du quiz-service** :
   ```bash
   kubectl logs -n intelectgame deployment/quiz-service --tail=50
   ```

2. **Vérifier la connexion MongoDB** :
   ```bash
   kubectl logs -n intelectgame deployment/quiz-service | grep MongoDB
   ```
   Devrait afficher : `✅ MongoDB connected (quiz-service)`

3. **Vérifier que MongoDB est accessible** :
   ```bash
   kubectl exec -it -n intelectgame deployment/quiz-service -- sh
   # Dans le pod:
   echo $MONGODB_URI
   ```

4. **Vérifier le ConfigMap** :
   ```bash
   kubectl get configmap app-config -n intelectgame -o yaml
   ```

### Erreurs courantes

#### MongoDB connection error
- **Cause** : MongoDB n'est pas accessible ou l'URI est incorrecte
- **Solution** : Vérifier que MongoDB est déployé et que le ConfigMap contient la bonne URI

#### Cannot find module
- **Cause** : Dépendances manquantes dans le conteneur
- **Solution** : Rebuild l'image Docker avec toutes les dépendances

#### Validation error
- **Cause** : Données invalides envoyées à l'API
- **Solution** : Vérifier le format des données (JSON valide, champs requis)

## 🛠️ Tests manuels avec curl

### Test création de question

```bash
curl -X POST http://82.202.141.248/api/quiz/create \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Test question",
    "choices": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A"
  }'
```

### Test inscription joueur

```bash
curl -X POST http://82.202.141.248/api/auth/players/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestPlayer"
  }'
```

### Test état du jeu

```bash
curl http://82.202.141.248/api/game/state
```

## 📊 Monitoring en temps réel

### Suivre les logs d'un service

```bash
# Quiz service
kubectl logs -n intelectgame deployment/quiz-service -f

# Auth service
kubectl logs -n intelectgame deployment/auth-service -f

# Game service
kubectl logs -n intelectgame deployment/game-service -f
```

### Voir les événements Kubernetes

```bash
kubectl get events -n intelectgame --sort-by='.lastTimestamp'
```

### Vérifier les ressources

```bash
# Statut des pods
kubectl get pods -n intelectgame

# Statut des services
kubectl get svc -n intelectgame

# Utilisation des ressources
kubectl top pods -n intelectgame
```

## ✅ Checklist de vérification

Avant de tester les endpoints, vérifiez :

- [ ] MongoDB est déployé et en cours d'exécution
- [ ] Tous les services sont en cours d'exécution
- [ ] Le ConfigMap `app-config` contient `MONGODB_URI`
- [ ] Les services peuvent se connecter à MongoDB (vérifier les logs)
- [ ] Le frontend peut accéder aux services via le proxy Nginx
- [ ] Les ports sont ouverts (firewall, NodePort, etc.)

## 🚀 Exécution rapide

```bash
# 1. Vérifier les logs
./check-service-logs.sh

# 2. Tester tous les endpoints
./test-all-endpoints.sh http://82.202.141.248

# 3. Si des erreurs, test détaillé
./test-endpoints-detailed.sh http://82.202.141.248
```

