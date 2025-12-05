# 🚀 Test Rapide de l'Internationalisation

## ⚡ Test en 5 Minutes

### 1. Démarrer l'Application

**En local :**
```bash
cd vue/front
npm run dev
```

**Ou si déployé :**
- Ouvrir l'URL de l'application dans le navigateur

---

### 2. Tester le Sélecteur de Langue

1. **Ouvrir l'interface joueur** : `http://localhost:5173/player/register` (ou votre URL)

2. **Localiser le sélecteur** :
   - Chercher l'icône 🌐 dans la navbar (en haut à droite)
   - Cliquer dessus

3. **Changer de langue** :
   - Cliquer sur "English" → Vérifier que tout change en anglais
   - Cliquer sur "Русский" → Vérifier que tout change en russe
   - Cliquer sur "Français" → Vérifier que tout revient en français

---

### 3. Vérifier les Traductions

#### Page d'Inscription (`/player/register`)
- [ ] Titre : "Entrer le code de la partie" (FR) / "Enter game code" (EN) / "Введите код игры" (RU)
- [ ] Bouton : "Vérifier le code" (FR) / "Verify code" (EN) / "Проверить код" (RU)
- [ ] Étape 2 : "Entrer votre nom" (FR) / "Enter your name" (EN) / "Введите ваше имя" (RU)

#### Page de Jeu (`/player/quiz`)
- [ ] "Question 1/5" (FR) / "Question 1/5" (EN) / "Вопрос 1/5" (RU)
- [ ] "Chargement..." (FR) / "Loading..." (EN) / "Загрузка..." (RU)
- [ ] "✓ Réponse enregistrée..." (FR) / "✓ Answer recorded..." (EN) / "✓ Ответ записан..." (RU)

#### Page de Classement (`/player/leaderboard`)
- [ ] "🏆 Classement" (FR) / "🏆 Leaderboard" (EN) / "🏆 Рейтинг" (RU)
- [ ] "Rejouer" (FR) / "Play again" (EN) / "Играть снова" (RU)

---

### 4. Tester la Persistance

1. **Changer la langue** en "English"
2. **Rafraîchir la page** (F5 ou Cmd+R)
3. **Vérifier** que la langue reste en "English" ✅

---

### 5. Test Rapide sur Mobile

1. **Ouvrir les outils de développement** (F12)
2. **Activer le mode responsive** (Ctrl+Shift+M)
3. **Sélectionner un appareil mobile** (iPhone, Android)
4. **Vérifier** que le sélecteur de langue fonctionne
5. **Vérifier** que seul l'icône 🌐 est visible (pas le nom)

---

## ✅ Checklist Rapide

- [ ] Sélecteur de langue visible (🌐)
- [ ] Menu déroulant fonctionne
- [ ] 3 langues disponibles (FR, EN, RU)
- [ ] Changement instantané
- [ ] Persistance après rafraîchissement
- [ ] Tous les textes traduits
- [ ] Fonctionne sur mobile

---

## 🐛 Si ça ne fonctionne pas

1. **Ouvrir la console** (F12)
2. **Vérifier les erreurs** JavaScript
3. **Vérifier localStorage** :
   ```javascript
   localStorage.getItem('gameLanguage')
   ```
4. **Vérifier que useI18n est importé** dans les composants

---

## 📖 Guide Complet

Pour un guide de test détaillé, consultez **TEST_I18N.md**

