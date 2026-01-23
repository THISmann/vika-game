# Feature: Partage de Parties - WhatsApp et Telegram

## ✅ Fonctionnalités Ajoutées

### 1. Boutons de Partage
- **WhatsApp** : Bouton avec logo WhatsApp pour partager la partie
- **Telegram** : Bouton avec logo Telegram pour partager la partie

### 2. Copie du Code en 1 Clic
- Le code de la partie est maintenant cliquable
- Un bouton de copie est disponible à côté du code
- Le code peut être copié en cliquant directement dessus ou sur le bouton de copie

## 📋 Message de Partage

Le message de partage contient :
- Le nom de la partie (si disponible)
- Le code de la partie
- Le lien du site : `http://www.vika-game.ru`

**Format du message** :
```
[Nom de la partie]

Code de la partie: [CODE]

Rejoignez la partie sur: http://www.vika-game.ru
```

## 🎨 Interface

### Code de la Partie
- Affiché dans une box grise avec fond `bg-gray-50`
- Le code est cliquable et copiable
- Un bouton de copie avec icône est disponible
- Hover effect pour indiquer que c'est cliquable

### Boutons de Partage
- Positionnés entre les informations de la partie et les boutons d'action
- Style moderne avec ombres et effets hover
- Logos officiels WhatsApp (vert) et Telegram (bleu)
- Texte descriptif sous chaque logo

## 🔧 Implémentation

### Fonctions Ajoutées

1. **`copyGameCode(gameCode)`**
   - Copie le code dans le presse-papiers
   - Utilise l'API Clipboard moderne avec fallback
   - Affiche une alerte de confirmation

2. **`shareOnWhatsApp(gameCode, partyName)`**
   - Ouvre WhatsApp avec le message pré-rempli
   - URL : `https://wa.me/?text=[message]`

3. **`shareOnTelegram(gameCode, partyName)`**
   - Ouvre Telegram avec le message pré-rempli
   - URL : `https://t.me/share/url?url=http://www.vika-game.ru&text=[message]`

## 📍 Localisation

Les traductions utilisées :
- `parties.copyCode` : "Cliquez pour copier" / "Copier le code"
- `parties.codeCopied` : "Code copié !"
- `parties.copyError` : "Erreur lors de la copie"
- `parties.shareWhatsApp` : "Partager sur WhatsApp"
- `parties.shareTelegram` : "Partager sur Telegram"

## 🚀 Déploiement

Les modifications ont été :
- ✅ Commitées dans Git
- ✅ Déployées sur le serveur
- ✅ Service frontend redémarré

## 📱 Utilisation

1. **Copier le code** : Cliquez sur le code de la partie ou sur le bouton de copie
2. **Partager sur WhatsApp** : Cliquez sur le bouton WhatsApp vert
3. **Partager sur Telegram** : Cliquez sur le bouton Telegram bleu

Les boutons ouvrent l'application respective avec le message pré-rempli, prêt à être envoyé.
