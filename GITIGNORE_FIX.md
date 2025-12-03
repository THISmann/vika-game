# Correction du .gitignore pour les fichiers de données

## Problème identifié

Le `.gitignore` pouvait potentiellement ignorer les fichiers JSON contenus dans les dossiers `data` des micro-services, alors que ces fichiers contiennent des informations importantes du jeu :
- `node/game-service/data/gameState.json` : État du jeu, code de partie, etc.
- `node/quiz-service/data/questions.json` : Questions du quiz
- `node/auth-service/data/users.json` : Utilisateurs/joueurs

## Solution appliquée

### 1. Modification du `.gitignore`

Ajout de règles explicites pour autoriser les fichiers JSON dans les dossiers `data` :

```gitignore
# Local data files - IMPORTANT: Keep game data files
# Allow JSON files in data directories of micro-services (they contain important game data)
!node/auth-service/data/*.json
!node/auth-service/data/.gitkeep
!node/quiz-service/data/*.json
!node/quiz-service/data/.gitkeep
!node/game-service/data/*.json
!node/game-service/data/.gitkeep
```

### 2. Création de fichiers `.gitkeep`

Création de fichiers `.gitkeep` dans chaque dossier `data` pour garantir que les dossiers sont versionnés même s'ils sont vides :
- `node/game-service/data/.gitkeep`
- `node/auth-service/data/.gitkeep`
- `node/quiz-service/data/.gitkeep`

## Vérification

Pour vérifier que les fichiers ne sont pas ignorés :

```bash
git check-ignore -v node/game-service/data/gameState.json
git check-ignore -v node/quiz-service/data/questions.json
git check-ignore -v node/auth-service/data/users.json
```

Si la commande ne retourne rien, les fichiers ne sont pas ignorés (c'est bon signe).

## Ajouter les fichiers au dépôt Git

Si les fichiers existent mais ne sont pas encore versionnés :

```bash
# Vérifier le statut
git status

# Ajouter les fichiers de données
git add node/*/data/*.json
git add node/*/data/.gitkeep

# Vérifier qu'ils sont bien ajoutés
git status

# Commit
git commit -m "feat: Add game data files (questions, users, game state)"
```

## Fichiers importants à versionner

Les fichiers suivants doivent être versionnés car ils contiennent des données importantes :

1. **Questions du quiz** : `node/quiz-service/data/questions.json`
   - Contient toutes les questions créées par l'admin
   - Essentiel pour le fonctionnement du jeu

2. **Utilisateurs** : `node/auth-service/data/users.json`
   - Contient les joueurs enregistrés
   - Important pour la persistance des données

3. **État du jeu** : `node/game-service/data/gameState.json`
   - Contient l'état actuel du jeu, le code de partie, etc.
   - Important pour la continuité du jeu

4. **Scores** : `node/game-service/data/scores.json`
   - Contient les scores des joueurs
   - Important pour le classement

## Note importante

⚠️ **Attention** : Ces fichiers contiennent des données sensibles (utilisateurs, scores). Assurez-vous que :
- Le dépôt Git est privé OU
- Les données sont anonymisées avant de les rendre publiques

## Vérification continue

Pour s'assurer que les fichiers restent versionnés, vous pouvez ajouter un test dans votre CI/CD :

```bash
# Vérifier que les fichiers de données existent
test -f node/quiz-service/data/questions.json || exit 1
test -f node/auth-service/data/users.json || exit 1
test -f node/game-service/data/gameState.json || exit 1
```

