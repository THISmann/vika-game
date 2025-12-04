# Internationalisation (i18n) - Implémentation

## ✅ Système Implémenté

Un système d'internationalisation simple et efficace a été créé pour permettre aux joueurs de choisir leur langue préférée (Français, English, Русский).

## 📁 Structure

### Fichier Principal
- `vue/front/src/composables/useI18n.js` : Composable Vue pour gérer les traductions

### Composants Internationalisés
- ✅ `vue/front/src/components/player/PlayerNavbar.vue` : Navbar avec sélecteur de langue
- ✅ `vue/front/src/components/player/PlayerRegister.vue` : Formulaire d'inscription
- ⏳ `vue/front/src/components/player/QuizPlay.vue` : Interface de jeu (en cours)
- ⏳ `vue/front/src/components/player/Leaderboard.vue` : Classement (en cours)

## 🌐 Langues Disponibles

1. **Français (fr)** - Langue par défaut
2. **English (en)**
3. **Русский (ru)**

## 🔧 Utilisation

### Dans un composant Vue

```vue
<script>
import { useI18n } from '@/composables/useI18n'

export default {
  setup() {
    const { t, language, changeLanguage, availableLanguages } = useI18n()
    return { t, language, changeLanguage, availableLanguages }
  }
}
</script>

<template>
  <div>
    <h1>{{ t('register.enterCode') }}</h1>
    <button @click="changeLanguage('en')">English</button>
  </div>
</template>
```

### Clés de traduction

Les clés suivent une structure hiérarchique :
- `nav.*` : Navigation
- `register.*` : Inscription
- `quiz.*` : Jeu/Quiz
- `leaderboard.*` : Classement
- `common.*` : Commun

## 💾 Persistance

La langue choisie est sauvegardée dans `localStorage` avec la clé `gameLanguage` et est automatiquement restaurée au chargement de la page.

## 🎨 Sélecteur de Langue

Le sélecteur de langue est intégré dans la navbar des joueurs avec :
- Icône globe 🌐
- Menu déroulant avec les 3 langues
- Indicateur visuel de la langue active
- Design responsive (nom de langue masqué sur mobile)

## 📝 Traductions Disponibles

### Navigation
- `nav.register` : S'inscrire / Register / Регистрация
- `nav.play` : 🎯 Jouer / 🎯 Play / 🎯 Играть
- `nav.leaderboard` : 🏆 Classement / 🏆 Leaderboard / 🏆 Рейтинг

### Inscription
- `register.enterCode` : Entrer le code de la partie
- `register.askCode` : Demandez le code à l'administrateur
- `register.gameCode` : Code de la partie
- `register.verifyCode` : Vérifier le code
- `register.enterName` : Entrer votre nom
- `register.name` : Votre nom
- `register.join` : Rejoindre la partie
- `register.waiting` : ⏳ En attente du démarrage
- `register.waitingDesc` : L'administrateur va bientôt démarrer la partie...
- Et plus...

### Quiz
- `quiz.waiting` : ⏳ En attente du début du jeu
- `quiz.loading` : Chargement...
- `quiz.question` : Question
- `quiz.submit` : Envoyer la réponse
- `quiz.correct` : Bonne réponse !
- `quiz.incorrect` : Réponse incorrecte
- Et plus...

### Leaderboard
- `leaderboard.title` : 🏆 Classement
- `leaderboard.subtitle` : Les meilleurs joueurs en temps réel
- `leaderboard.loading` : Chargement du classement...
- `leaderboard.empty` : Aucun joueur pour le moment
- Et plus...

## 🚀 Prochaines Étapes

1. ✅ Système i18n créé
2. ✅ Sélecteur de langue dans navbar
3. ✅ PlayerRegister internationalisé
4. ⏳ QuizPlay à internationaliser
5. ⏳ Leaderboard à internationaliser
6. ⏳ Tests avec les 3 langues

## 🔄 Ajout de Nouvelles Langues

Pour ajouter une nouvelle langue :

1. Ajouter l'objet de traduction dans `useI18n.js` :
```javascript
const translations = {
  fr: { ... },
  en: { ... },
  ru: { ... },
  es: {  // Nouvelle langue
    'nav.register': 'Registrarse',
    // ... toutes les clés
  }
}
```

2. Ajouter le nom de la langue dans `getLanguageName()` :
```javascript
const names = {
  fr: 'Français',
  en: 'English',
  ru: 'Русский',
  es: 'Español'  // Nouvelle langue
}
```

3. Ajouter la langue dans `availableLanguages` :
```javascript
availableLanguages: ['fr', 'en', 'ru', 'es']
```

