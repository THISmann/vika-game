# Guide de Test - Internationalisation (i18n)

## 🧪 Comment Tester l'Internationalisation

### Prérequis

1. **Application déployée** (localement ou sur le serveur)
2. **Navigateur web** (Chrome, Firefox, Safari, etc.)
3. **Accès à l'interface joueur**

---

## 📋 Étapes de Test

### 1. Test du Sélecteur de Langue

#### A. Accéder à l'interface joueur
- Ouvrir l'application dans le navigateur
- Aller sur la page d'inscription : `/player/register`
- Vérifier que la navbar est visible en haut

#### B. Tester le sélecteur de langue
1. **Localiser le sélecteur** :
   - Chercher l'icône 🌐 dans la navbar (à droite)
   - Sur mobile : icône seule
   - Sur desktop : icône + nom de la langue

2. **Ouvrir le menu** :
   - Cliquer sur l'icône 🌐
   - Un menu déroulant doit apparaître avec 3 options :
     - Français
     - English
     - Русский

3. **Changer de langue** :
   - Cliquer sur "English"
   - Vérifier que l'interface change immédiatement
   - Cliquer sur "Русский"
   - Vérifier que l'interface change en russe
   - Revenir à "Français"

---

### 2. Test de Persistance

#### A. Tester la sauvegarde
1. Changer la langue en "English"
2. **Rafraîchir la page** (F5 ou Cmd+R)
3. Vérifier que la langue reste en "English"

#### B. Tester sur différentes pages
1. Aller sur `/player/register` → Changer en "English"
2. Naviguer vers `/player/quiz` → Vérifier que c'est toujours en "English"
3. Naviguer vers `/player/leaderboard` → Vérifier que c'est toujours en "English"
4. Revenir à `/player/register` → Vérifier que c'est toujours en "English"

#### C. Tester la restauration
1. Fermer complètement le navigateur
2. Rouvrir l'application
3. Vérifier que la langue choisie est toujours active

---

### 3. Test des Traductions par Composant

#### A. PlayerRegister.vue

**Test en Français (par défaut)** :
- ✅ "Entrer le code de la partie"
- ✅ "Demandez le code à l'administrateur"
- ✅ "Code de la partie"
- ✅ "Vérifier le code"
- ✅ "Entrer votre nom"
- ✅ "Votre nom"
- ✅ "Rejoindre la partie"
- ✅ "⏳ En attente du démarrage"

**Test en English** :
- ✅ "Enter game code"
- ✅ "Ask the administrator for the code"
- ✅ "Game code"
- ✅ "Verify code"
- ✅ "Enter your name"
- ✅ "Your name"
- ✅ "Join game"
- ✅ "⏳ Waiting for game to start"

**Test en Русский** :
- ✅ "Введите код игры"
- ✅ "Попросите код у администратора"
- ✅ "Код игры"
- ✅ "Проверить код"
- ✅ "Введите ваше имя"
- ✅ "Ваше имя"
- ✅ "Присоединиться к игре"
- ✅ "⏳ Ожидание начала игры"

#### B. QuizPlay.vue

**Test en Français** :
- ✅ "⏳ En attente du début du jeu"
- ✅ "Chargement..."
- ✅ "Question 1/5"
- ✅ "✓ Réponse enregistrée. En attente de la question suivante..."
- ✅ "Joueur"
- ✅ "🎉 Quiz terminé !"
- ✅ "Félicitations ! Le jeu est terminé. Consultez vos résultats ci-dessous."
- ✅ "Résultats des questions"
- ✅ "Votre réponse"
- ✅ "Bonne réponse"
- ✅ "Voir le classement"

**Test en English** :
- ✅ "⏳ Waiting for game to start"
- ✅ "Loading..."
- ✅ "Question 1/5"
- ✅ "✓ Answer recorded. Waiting for next question..."
- ✅ "Player"
- ✅ "🎉 Quiz completed!"
- ✅ "Congratulations! The game is over. Check your results below."
- ✅ "Question results"
- ✅ "Your answer"
- ✅ "Correct answer"
- ✅ "View leaderboard"

**Test en Русский** :
- ✅ "⏳ Ожидание начала игры"
- ✅ "Загрузка..."
- ✅ "Вопрос 1/5"
- ✅ "✓ Ответ записан. Ожидание следующего вопроса..."
- ✅ "Игрок"
- ✅ "🎉 Викторина завершена!"
- ✅ "Поздравляем! Игра окончена. Посмотрите свои результаты ниже."
- ✅ "Результаты вопросов"
- ✅ "Ваш ответ"
- ✅ "Правильный ответ"
- ✅ "Посмотреть рейтинг"

#### C. Leaderboard.vue

**Test en Français** :
- ✅ "🏆 Classement"
- ✅ "Les meilleurs joueurs en temps réel"
- ✅ "Chargement du classement..."
- ✅ "Aucun joueur pour le moment"
- ✅ "Joueur anonyme"
- ✅ "pts"
- ✅ "Rejouer"
- ✅ "Nouveau joueur"

**Test en English** :
- ✅ "🏆 Leaderboard"
- ✅ "Top players in real-time"
- ✅ "Loading leaderboard..."
- ✅ "No players yet"
- ✅ "Anonymous player"
- ✅ "pts"
- ✅ "Play again"
- ✅ "New player"

**Test en Русский** :
- ✅ "🏆 Рейтинг"
- ✅ "Лучшие игроки в реальном времени"
- ✅ "Загрузка рейтинга..."
- ✅ "Пока нет игроков"
- ✅ "Анонимный игрок"
- ✅ "очков"
- ✅ "Играть снова"
- ✅ "Новый игрок"

---

### 4. Test des Messages d'Erreur

#### A. Test en Français
1. Entrer un code invalide → Vérifier "Code invalide"
2. Essayer de s'inscrire sans nom → Vérifier "Veuillez entrer un nom valide..."
3. Nom déjà pris → Vérifier "Ce nom est déjà pris..."

#### B. Test en English
1. Changer en English
2. Répéter les mêmes tests
3. Vérifier que les messages sont en anglais

#### C. Test en Русский
1. Changer en Русский
2. Répéter les mêmes tests
3. Vérifier que les messages sont en russe

---

### 5. Test Responsive (Mobile/Tablet)

#### A. Sur mobile
1. Ouvrir l'application sur un téléphone
2. Vérifier que le sélecteur de langue (🌐) est visible
3. Vérifier que seul l'icône est affichée (pas le nom)
4. Cliquer sur l'icône → Menu déroulant doit apparaître
5. Changer de langue → Vérifier que tout fonctionne

#### B. Sur tablette
1. Ouvrir l'application sur une tablette
2. Vérifier que le sélecteur affiche l'icône + nom de la langue
3. Tester le changement de langue

---

### 6. Test de Performance

#### A. Changement rapide de langue
1. Changer rapidement entre les 3 langues
2. Vérifier qu'il n'y a pas de délai
3. Vérifier qu'il n'y a pas d'erreurs dans la console

#### B. Test avec plusieurs onglets
1. Ouvrir l'application dans 2 onglets
2. Changer la langue dans l'onglet 1
3. Rafraîchir l'onglet 2
4. Vérifier que la langue est synchronisée

---

## 🔍 Vérifications Techniques

### 1. Vérifier localStorage

Ouvrir la console du navigateur (F12) et exécuter :

```javascript
// Vérifier la langue sauvegardée
localStorage.getItem('gameLanguage')

// Changer manuellement la langue
localStorage.setItem('gameLanguage', 'en')

// Rafraîchir la page pour voir le changement
```

### 2. Vérifier les erreurs

1. Ouvrir la console (F12)
2. Changer de langue plusieurs fois
3. Vérifier qu'il n'y a pas d'erreurs JavaScript
4. Vérifier qu'il n'y a pas d'erreurs de traduction (clés manquantes)

### 3. Vérifier la réactivité

1. Changer de langue
2. Vérifier que tous les textes changent immédiatement
3. Vérifier qu'il n'y a pas de flash de contenu non traduit

---

## ✅ Checklist de Test Complète

### Navigation
- [ ] Sélecteur de langue visible dans la navbar
- [ ] Menu déroulant fonctionne
- [ ] 3 langues disponibles (FR, EN, RU)
- [ ] Changement de langue instantané

### Persistance
- [ ] Langue sauvegardée après rafraîchissement
- [ ] Langue conservée entre les pages
- [ ] Langue restaurée après fermeture du navigateur

### Traductions
- [ ] PlayerRegister : Tous les textes traduits
- [ ] QuizPlay : Tous les textes traduits
- [ ] Leaderboard : Tous les textes traduits
- [ ] Messages d'erreur traduits

### Responsive
- [ ] Fonctionne sur mobile
- [ ] Fonctionne sur tablette
- [ ] Fonctionne sur desktop

### Performance
- [ ] Pas de délai lors du changement
- [ ] Pas d'erreurs dans la console
- [ ] Pas de flash de contenu non traduit

---

## 🐛 Problèmes Courants et Solutions

### Problème : La langue ne change pas
**Solution** :
1. Vérifier la console pour les erreurs
2. Vérifier que `useI18n` est bien importé
3. Vérifier que `setup()` retourne `{ t }`

### Problème : La langue n'est pas sauvegardée
**Solution** :
1. Vérifier que `localStorage` est disponible
2. Vérifier que `setLanguage()` est appelé
3. Vérifier les permissions du navigateur

### Problème : Certains textes ne sont pas traduits
**Solution** :
1. Vérifier que la clé de traduction existe dans `useI18n.js`
2. Vérifier que `t('clé')` est utilisé dans le composant
3. Vérifier que la clé est correcte (sans fautes de frappe)

---

## 📝 Notes de Test

- **Tester sur différents navigateurs** : Chrome, Firefox, Safari, Edge
- **Tester sur différents appareils** : Desktop, Tablet, Mobile
- **Tester avec différentes connexions** : WiFi, 4G, 3G
- **Tester avec différentes tailles d'écran** : Small, Medium, Large

---

## 🎯 Résultat Attendu

Après tous ces tests, vous devriez avoir :
- ✅ Une interface complètement traduite dans les 3 langues
- ✅ Un sélecteur de langue fonctionnel et accessible
- ✅ Une persistance de la langue choisie
- ✅ Aucune erreur dans la console
- ✅ Une expérience utilisateur fluide et réactive

