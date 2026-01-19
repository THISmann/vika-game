# 📖 Guide Utilisateur IntelectGame - Tutoriel Complet

## 🎯 Bienvenue sur IntelectGame !

Ce guide vous accompagne pas à pas pour tester et utiliser la plateforme IntelectGame. Vous apprendrez à créer des quiz, participer à des parties et utiliser toutes les fonctionnalités.

---

## 🔐 Accès à la Plateforme

### 🌐 **URLs d'Accès**

#### **Environnement Local (Développement)**
- **Frontend Joueur** : `http://localhost:5173/vika-game/`
- **Frontend Admin** : `http://localhost:5174/vika-admin/admin/login`
- **Dashboard Traefik** : `http://localhost:8080/dashboard/`

#### **Environnement Production (Serveur)**
- **Frontend Joueur** : `http://82.202.141.248/vika-game/`
- **Frontend Admin** : `http://82.202.141.248/vika-admin/admin/login`
- **Dashboard Traefik** : `http://82.202.141.248/dashboard/`

---

## 🔑 Identifiants par Défaut

### 👨‍💼 **Connexion Administrateur**

**URL:** `http://localhost:5174/vika-admin/admin/login` (local) ou `http://82.202.141.248/vika-admin/admin/login` (production)

**Identifiants:**
- **Username (Nom d'utilisateur):** `admin`
- **Password (Mot de passe):** `admin`

### 👤 **Connexion Utilisateur/Admin (User Dashboard)**

**URL:** `http://localhost:5173/vika-game/user/login` (local) ou `http://82.202.141.248/vika-game/user/login` (production)

**Identifiants:**
- **Email:** `admin@vika-game.com`
- **Password (Mot de passe):** `admin`

⚠️ **IMPORTANT:** Vous devez entrer l'**EMAIL complet** (`admin@vika-game.com`), pas juste `admin`.

---

## 📋 Tutoriel: Premier Test de la Plateforme

### **Étape 1: Accéder au Dashboard Administrateur**

1. Ouvrez votre navigateur (Chrome, Firefox, Safari, etc.)
2. Allez à l'URL admin :
   - Local : `http://localhost:5174/vika-admin/admin/login`
   - Production : `http://82.202.141.248/vika-admin/admin/login`
3. Vous verrez la page de connexion
4. Entrez les identifiants :
   - **Username:** `admin`
   - **Password:** `admin`
5. Cliquez sur "Se connecter" ou "Login"

✅ **Résultat attendu:** Vous êtes maintenant connecté au dashboard administrateur.

---

### **Étape 2: Créer Votre Première Question**

1. Dans le dashboard admin, cherchez la section **"Gestion des Questions"** ou **"Manage Questions"**
2. Cliquez sur **"Nouvelle Question"** ou **"Create Question"**
3. Remplissez le formulaire :
   - **Question:** Entrez votre question (ex: "Quelle est la capitale de la France?")
   - **Réponse A:** Entrez une option (ex: "Paris")
   - **Réponse B:** Entrez une option (ex: "Lyon")
   - **Réponse C:** Entrez une option (ex: "Marseille")
   - **Réponse D:** Entrez une option (ex: "Toulouse")
   - **Bonne réponse:** Sélectionnez la bonne réponse (A, B, C ou D)
   - **Points:** Définissez les points pour cette question (ex: 10)
   - **Temps (optionnel):** Temps en secondes pour répondre (ex: 30)
4. Cliquez sur **"Créer"** ou **"Create"**

✅ **Résultat attendu:** Votre question est maintenant créée et apparaît dans la liste des questions.

**💡 Astuce:** Créez 3-5 questions pour votre premier test.

---

### **Étape 3: Créer une Partie de Quiz**

1. Dans le dashboard admin, cherchez la section **"Parties"** ou **"Games"**
2. Cliquez sur **"Nouvelle Partie"** ou **"Create Game"**
3. Remplissez les informations :
   - **Nom de la partie:** Donnez un nom (ex: "Quiz de Test")
   - **Code de partie:** Un code sera généré automatiquement (ex: ABC123) ou vous pouvez le définir manuellement
   - **Questions:** Sélectionnez les questions que vous voulez inclure
   - **Date et heure (optionnel):** Vous pouvez programmer la partie pour qu'elle démarre plus tard
4. Cliquez sur **"Créer la Partie"** ou **"Create Game"**

✅ **Résultat attendu:** Une nouvelle partie est créée avec un code unique. **Notez ce code**, vous en aurez besoin pour y participer !

---

### **Étape 4: Démarrer la Partie**

1. Dans la liste des parties, trouvez la partie que vous venez de créer
2. Vous devriez voir le **code de la partie** (ex: ABC123)
3. Cliquez sur **"Démarrer"** ou **"Start"** quand vous êtes prêt

✅ **Résultat attendu:** La partie démarre et attend que les joueurs se connectent.

---

### **Étape 5: Participer en Tant Que Joueur (Nouvelle Fenêtre)**

**Maintenant, testons la participation en tant que joueur :**

1. **Ouvrez une nouvelle fenêtre** ou un **nouvel onglet** de votre navigateur
2. Allez à l'URL du frontend joueur :
   - Local : `http://localhost:5173/vika-game/player/register`
   - Production : `http://82.202.141.248/vika-game/player/register`
3. Vous verrez la page d'inscription
4. Entrez les informations :
   - **Code de partie:** Entrez le code de votre partie (ex: ABC123)
   - **Nom:** Entrez votre nom (ex: "Test Joueur")
5. Cliquez sur **"Rejoindre"** ou **"Join"**

✅ **Résultat attendu:** Vous êtes maintenant inscrit à la partie et attendez que l'administrateur démarre le quiz.

**🔄 Retournez à la fenêtre admin** pour voir que votre joueur est maintenant connecté !

---

### **Étape 6: Voir les Joueurs Connectés (Dashboard Admin)**

1. Dans votre **fenêtre admin**, regardez le dashboard
2. Vous devriez voir :
   - **Nombre de joueurs connectés:** 1 (ou plus si vous avez ouvert plusieurs fenêtres)
   - **Liste des joueurs:** Le nom "Test Joueur" devrait apparaître

✅ **Résultat attendu:** Vous pouvez voir les joueurs connectés en temps réel.

---

### **Étape 7: Répondre aux Questions (Fenêtre Joueur)**

1. Dans votre **fenêtre joueur**, attendez que l'administrateur démarre le quiz
2. Quand le quiz démarre, la **première question** apparaît automatiquement
3. Un **compte à rebours** démarre (ex: 30 secondes)
4. Cliquez sur **votre réponse** (A, B, C ou D)
5. Votre réponse est enregistrée et un message de confirmation apparaît

✅ **Résultat attendu:** Votre réponse est enregistrée instantanément.

---

### **Étape 8: Suivre le Classement (Les Deux Fenêtres)**

#### **Fenêtre Joueur:**
- Après chaque question, vous pouvez voir votre **score en temps réel**
- Un **classement** peut apparaître montrant votre position

#### **Fenêtre Admin:**
- Dans le dashboard admin, vous pouvez voir :
  - Le **classement en direct** de tous les joueurs
  - Les **scores** mis à jour après chaque question
  - Les **statistiques** de la partie en cours

✅ **Résultat attendu:** Les deux interfaces sont synchronisées en temps réel !

---

### **Étape 9: Terminer la Partie**

1. Dans le **dashboard admin**, après la dernière question :
2. Cliquez sur **"Terminer la Partie"** ou **"End Game"**
3. Les **résultats finaux** s'affichent :
   - Classement final
   - Scores finaux de tous les joueurs
   - Statistiques détaillées

#### **Fenêtre Joueur:**
- Dans la **fenêtre joueur**, les résultats finaux apparaissent également :
  - Votre score final
  - Votre position dans le classement
  - Statistiques personnelles (bonnes/mauvaises réponses)

✅ **Résultat attendu:** La partie est terminée avec des résultats clairs pour tous.

---

## 🎯 Test Rapide (5 Minutes)

Si vous voulez tester rapidement la plateforme :

1. ✅ **Connectez-vous en admin** (`admin` / `admin`)
2. ✅ **Créez 2 questions simples**
3. ✅ **Créez une partie** et notez le code
4. ✅ **Ouvrez une nouvelle fenêtre** et rejoignez en tant que joueur
5. ✅ **Démarrez la partie** depuis le dashboard admin
6. ✅ **Répondez aux questions** dans la fenêtre joueur
7. ✅ **Voyez les résultats** dans les deux fenêtres

---

## 🐛 Dépannage

### **Je ne peux pas me connecter en admin**

**Vérifiez:**
- ✅ Vous utilisez le bon URL (`/vika-admin/admin/login`)
- ✅ Le username est `admin` (pas `admin@vika-game.com`)
- ✅ Le password est `admin`
- ✅ Les services backend sont démarrés (`docker ps`)

**Solution:** Vérifiez que les containers Docker sont en cours d'exécution.

---

### **Je ne peux pas me connecter en utilisateur**

**Vérifiez:**
- ✅ Vous utilisez l'URL `/vika-game/user/login` (pas `/vika-admin`)
- ✅ L'email est `admin@vika-game.com` (email complet, pas juste `admin`)
- ✅ Le password est `admin`

**Solution:** Assurez-vous d'utiliser l'email complet avec `@vika-game.com`.

---

### **Le code de partie ne fonctionne pas**

**Vérifiez:**
- ✅ La partie a bien été créée dans le dashboard admin
- ✅ La partie n'est pas encore terminée
- ✅ Vous entrez le code en **majuscules** (ex: ABC123, pas abc123)
- ✅ La partie a été démarrée par l'administrateur

**Solution:** Vérifiez dans le dashboard admin que la partie existe et est active.

---

### **Les questions ne s'affichent pas pour le joueur**

**Vérifiez:**
- ✅ L'administrateur a démarré la partie
- ✅ La partie a des questions assignées
- ✅ Votre connexion WebSocket fonctionne (vérifiez la console du navigateur)

**Solution:** Assurez-vous que la partie est démarrée et que le joueur est bien connecté.

---

## 📸 Captures d'Écran Attendu (Guide Visuel)

### **1. Page de Connexion Admin**
```
┌─────────────────────────────────┐
│    IntelectGame Admin Login     │
├─────────────────────────────────┤
│  Username: [admin          ]    │
│  Password: [••••••         ]    │
│                                 │
│        [  Se connecter  ]       │
└─────────────────────────────────┘
```

### **2. Dashboard Admin**
```
┌─────────────────────────────────┐
│  Dashboard                      │
├─────────────────────────────────┤
│  Partie en cours: Quiz Test     │
│  Code: ABC123                   │
│  Joueurs connectés: 2           │
│                                 │
│  [Démarrer] [Question Suivante] │
└─────────────────────────────────┘
```

### **3. Page d'Inscription Joueur**
```
┌─────────────────────────────────┐
│    Rejoindre une Partie         │
├─────────────────────────────────┤
│  Code de partie: [ABC123    ]   │
│  Votre nom:     [Test Joueur]   │
│                                 │
│        [  Rejoindre  ]          │
└─────────────────────────────────┘
```

### **4. Interface de Quiz (Joueur)**
```
┌─────────────────────────────────┐
│  Question 1 / 5                 │
│  Temps: 25s                     │
├─────────────────────────────────┤
│  Quelle est la capitale...?     │
│                                 │
│  [A] Paris                      │
│  [B] Lyon                       │
│  [C] Marseille                  │
│  [D] Toulouse                   │
│                                 │
│  Votre score: 0 pts             │
└─────────────────────────────────┘
```

---

## ✅ Checklist de Test Complète

Utilisez cette checklist pour tester toutes les fonctionnalités :

### **Côté Administrateur**
- [ ] Connexion avec les identifiants par défaut
- [ ] Création d'une question
- [ ] Modification d'une question
- [ ] Suppression d'une question
- [ ] Création d'une partie
- [ ] Voir les joueurs connectés
- [ ] Démarrer une partie
- [ ] Voir le classement en temps réel
- [ ] Passer à la question suivante
- [ ] Terminer une partie
- [ ] Voir les résultats finaux

### **Côté Joueur**
- [ ] Inscription avec un code de partie
- [ ] Voir la question affichée
- [ ] Répondre à une question
- [ ] Voir le compte à rebours
- [ ] Voir son score en temps réel
- [ ] Voir le classement
- [ ] Voir les résultats finaux

---

## 🎓 Prochaines Étapes

Maintenant que vous avez testé les fonctionnalités de base :

1. ✅ **Créez vos propres questions** sur vos sujets préférés
2. ✅ **Organisez une vraie partie** avec des amis ou collègues
3. ✅ **Explorez les statistiques** et analyses après une partie
4. ✅ **Testez avec plusieurs joueurs** pour voir la synchronisation en temps réel

---

## 💬 Support

Si vous rencontrez des problèmes :
1. Vérifiez la section **Dépannage** ci-dessus
2. Vérifiez les logs Docker : `docker logs intelectgame-auth`
3. Vérifiez la console du navigateur (F12) pour les erreurs JavaScript

---

**Bon quiz ! 🎮✨**

*Dernière mise à jour: 2026*

