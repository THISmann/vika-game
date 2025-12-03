# Correction de la route /quiz/questions

## 🔍 Problème

L'endpoint `/api/quiz/questions` retournait 404 car la route n'existait pas dans `quiz.routes.js`.

## ✅ Solution appliquée

### 1. Ajout de la route manquante

**Fichier** : `node/quiz-service/routes/quiz.routes.js`

Ajout de la route `/questions` comme alias de `/all` :

```javascript
router.get("/all", quizController.getQuestions);
router.get("/questions", quizController.getQuestions); // Alias pour compatibilité
router.get("/full", quizController.getFullQuestions);
```

### 2. Mise à jour du frontend

**Fichier** : `vue/front/src/config/api.js`

Ajout de l'URL `questions` dans `API_URLS.quiz` :

```javascript
quiz: {
  all: `${API_CONFIG.QUIZ_SERVICE}/all`,
  questions: `${API_CONFIG.QUIZ_SERVICE}/questions`, // Alias pour /all
  full: `${API_CONFIG.QUIZ_SERVICE}/full`,
  // ...
}
```

### 3. Mise à jour des scripts de test

Les scripts de test ont été mis à jour pour tester les deux routes :
- `/quiz/all` (route principale)
- `/quiz/questions` (alias)

## 🚀 Application des corrections

### Sur votre machine locale

1. **Rebuild l'image quiz-service** :
   ```bash
   cd node/quiz-service
   docker build -t thismann17/gamev2-quiz-service:latest .
   docker push thismann17/gamev2-quiz-service:latest
   ```

2. **Rebuild le frontend** (si nécessaire) :
   ```bash
   cd vue
   docker build -t thismann17/gamev2-frontend:latest .
   docker push thismann17/gamev2-frontend:latest
   ```

### Sur le serveur

```bash
# Redémarrer quiz-service
kubectl rollout restart deployment/quiz-service -n intelectgame

# Redémarrer frontend (si modifié)
kubectl rollout restart deployment/frontend -n intelectgame

# Vérifier
kubectl rollout status deployment/quiz-service -n intelectgame
```

## ✅ Vérification

Après le redéploiement, testez :

```bash
# Tester les endpoints
./test-all-endpoints.sh http://82.202.141.248

# Les deux routes devraient maintenant fonctionner :
curl http://82.202.141.248/api/quiz/all
curl http://82.202.141.248/api/quiz/questions
```

## 📝 Routes disponibles

- ✅ `GET /api/quiz/all` - Liste des questions (sans réponses)
- ✅ `GET /api/quiz/questions` - Alias de `/all` (sans réponses)
- ✅ `GET /api/quiz/full` - Liste complète (avec réponses)
- ✅ `POST /api/quiz/create` - Créer une question
- ✅ `PUT /api/quiz/:id` - Modifier une question
- ✅ `DELETE /api/quiz/:id` - Supprimer une question

