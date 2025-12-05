# 🚀 Workflow de Développement et Déploiement

**Version**: 1.0  
**Dernière mise à jour**: Décembre 2024

---

## Vue d'ensemble

Ce workflow permet de :
1. **Tester localement** avec Docker Compose sur une branche de feature
2. **Valider les tests** avant de push
3. **Déployer automatiquement** sur main après validation

---

## Workflow Complet

```
┌─────────────────────────────────────────────────────────┐
│  1. Créer une branche de feature                        │
│     git checkout -b feature/my-feature                  │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  2. Développer et tester localement                     │
│     make test-local                                     │
│     ou                                                  │
│     ./scripts/test-local.sh                            │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  3. Si tests OK, push sur la branche                    │
│     make push                                           │
│     ou                                                  │
│     ./scripts/test-and-push.sh                         │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  4. Créer une Pull Request vers main                    │
│     (via GitHub ou gh cli)                              │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  5. GitHub Actions exécute les tests                     │
│     - Tests unitaires                                   │
│     - Tests d'intégration                               │
│     - Build Docker images (si PR merge)                │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  6. Merge vers main                                     │
│     - Build automatique des images Docker              │
│     - Push vers DockerHub                               │
│     - Déploiement Kubernetes (optionnel)                │
└─────────────────────────────────────────────────────────┘
```

---

## Utilisation Locale

### 1. Tester Localement

#### Option A: Avec Makefile (Recommandé)

```bash
# Démarrer les services de test
make up

# Exécuter tous les tests
make test-local

# Voir les logs
make logs

# Arrêter les services
make down

# Nettoyer tout
make clean
```

#### Option B: Avec Docker Compose directement

```bash
# Démarrer les services
docker-compose -f docker-compose.test.yml up -d

# Voir les logs
docker-compose -f docker-compose.test.yml logs -f

# Arrêter les services
docker-compose -f docker-compose.test.yml down

# Nettoyer volumes
docker-compose -f docker-compose.test.yml down -v
```

#### Option C: Avec le script

```bash
# Exécuter tous les tests
./scripts/test-local.sh
```

---

### 2. Tester puis Push

#### Option A: Avec Makefile

```bash
# Tester puis push (avec menu interactif)
make push
```

#### Option B: Avec le script

```bash
# Tester puis push (avec menu interactif)
./scripts/test-and-push.sh
```

**Le script vous proposera**:
1. Push sur la branche actuelle
2. Créer une Pull Request vers main
3. Merge et push direct sur main (non recommandé)
4. Annuler

---

## Services de Test

Les services suivants sont démarrés avec `docker-compose.test.yml`:

| Service | Port | URL |
|---------|------|-----|
| MongoDB | 27018 | `mongodb://localhost:27018` |
| Redis | 6380 | `redis://localhost:6380` |
| Auth Service | 3001 | `http://localhost:3001` |
| Quiz Service | 3002 | `http://localhost:3002` |
| Game Service | 3003 | `http://localhost:3003` |
| Telegram Bot | 3004 | `http://localhost:3004` |
| Frontend | 5173 | `http://localhost:5173` |

**Note**: Les ports sont différents de la production pour éviter les conflits.

---

## Pipeline GitHub Actions

### Déclencheurs

Le pipeline se déclenche sur :
- **Push** sur n'importe quelle branche
- **Pull Request** vers main/master/develop
- **Workflow dispatch** (manuel)

### Jobs

#### 1. Test (Parallèle)

Exécute les tests unitaires et le linting pour chaque service :
- `auth-service`
- `quiz-service`
- `game-service`
- `frontend`

**Durée estimée**: 5-10 minutes

---

#### 2. Integration Tests

Exécute les tests d'intégration avec Docker Compose :
- Démarre tous les services
- Attend que les services soient prêts
- Exécute `test-all-endpoints.sh`
- Nettoie les conteneurs

**Durée estimée**: 5-10 minutes

---

#### 3. Build (Seulement sur main/master/develop)

Build et push les images Docker vers DockerHub :
- `thismann17/gamev2-auth-service:latest`
- `thismann17/gamev2-quiz-service:latest`
- `thismann17/gamev2-game-service:latest`
- `thismann17/gamev2-telegram-bot:latest`
- `thismann17/gamev2-frontend:latest`

**Condition**: Seulement si les tests passent

**Durée estimée**: 10-15 minutes

---

#### 4. Deploy (Seulement sur main/master)

Déploie sur Kubernetes (si configuré) :
- Applique les configurations K8s
- Redémarre les déploiements
- Vérifie le statut

**Condition**: Seulement sur main/master après build réussi

**Durée estimée**: 5-10 minutes

---

## Exemple de Workflow

### Scénario 1: Développement d'une nouvelle fonctionnalité

```bash
# 1. Créer une branche
git checkout -b feature/add-new-question-type

# 2. Développer
# ... faire vos modifications ...

# 3. Tester localement
make test-local

# 4. Si tests OK, commit et push
git add .
git commit -m "feat: add new question type"
make push  # Choisir option 1: Push sur la branche

# 5. Créer une Pull Request
gh pr create --title "Feature: Add new question type" --body "Tests passés ✅"
```

---

### Scénario 2: Correction de bug

```bash
# 1. Créer une branche
git checkout -b fix/score-calculation-bug

# 2. Corriger le bug
# ... faire vos modifications ...

# 3. Tester localement
make test-local

# 4. Si tests OK, commit et push
git add .
git commit -m "fix: correct score calculation"
make push  # Choisir option 1: Push sur la branche

# 5. Créer une Pull Request
gh pr create --title "Fix: Score calculation bug" --body "Tests passés ✅"
```

---

## Commandes Rapides

### Développement

```bash
# Démarrer les services
make up

# Tester
make test-local

# Voir les logs
make logs

# Arrêter
make down
```

### Tests Individuels

```bash
# Tester un service spécifique
make test-auth
make test-quiz
make test-game
make test-telegram
make test-frontend

# Tester les endpoints API
make test-integration

# Vérifier la santé des services
make health
```

### Configuration Telegram Bot

Pour tester avec le Telegram Bot, vous devez fournir le token :

```bash
# Option 1: Variable d'environnement
export TELEGRAM_BOT_TOKEN=your_token_here
make up

# Option 2: Fichier .env
echo "TELEGRAM_BOT_TOKEN=your_token_here" > node/telegram-bot/.env
make up
```

**Note**: Le bot fonctionnera même sans token valide pour les tests, mais ne pourra pas recevoir de messages Telegram.

### Déploiement

```bash
# Tester puis push (menu interactif)
make push

# Nettoyer tout
make clean
```

---

## Configuration Requise

### Prérequis Locaux

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Node.js** 20+
- **Git** 2.30+

### Secrets GitHub

Les secrets suivants doivent être configurés dans GitHub :

- `DOCKER_USERNAME`: Nom d'utilisateur DockerHub
- `DOCKER_PASSWORD`: Mot de passe DockerHub
- `KUBECONFIG`: Configuration Kubernetes (base64) - optionnel

---

## Dépannage

### Les services ne démarrent pas

```bash
# Vérifier les ports
netstat -an | grep -E "3001|3002|3003|27018|6380"

# Nettoyer et redémarrer
make clean
make up
```

### Les tests échouent

```bash
# Voir les logs détaillés
make logs

# Vérifier la santé des services
make health

# Redémarrer les services
make down
make up
```

### Erreur de build Docker

```bash
# Nettoyer le cache Docker
docker system prune -a

# Rebuild sans cache
docker-compose -f docker-compose.test.yml build --no-cache
```

---

## Bonnes Pratiques

1. **Toujours tester localement** avant de push
2. **Créer une branche** pour chaque feature/fix
3. **Utiliser des commits clairs** (feat:, fix:, docs:, etc.)
4. **Créer une Pull Request** plutôt que push direct sur main
5. **Vérifier les tests GitHub Actions** avant de merger
6. **Nettoyer régulièrement** avec `make clean`

---

## Résumé

✅ **Tests locaux** avec Docker Compose  
✅ **Validation automatique** avant push  
✅ **Pipeline CI/CD** complet  
✅ **Build automatique** sur main  
✅ **Déploiement automatique** (optionnel)  

**Workflow simple et sécurisé** pour développer et déployer avec confiance ! 🚀

---

**Version**: 1.0  
**Dernière mise à jour**: Décembre 2024

