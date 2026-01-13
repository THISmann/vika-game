# Admin Panel - Vika-Game

Panel d'administration séparé pour la gestion du jeu Vika-Game.

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

Le serveur de développement démarre sur `http://localhost:5174`

## Build

```bash
npm run build
```

## Structure

```
vue/admin/
├── src/
│   ├── components/
│   │   └── admin/          # Composants admin
│   ├── composables/        # Composables Vue (useI18n, etc.)
│   ├── config/            # Configuration (API URLs, etc.)
│   ├── router/            # Routes et guards
│   ├── services/           # Services API
│   ├── assets/            # Styles CSS
│   ├── App.vue            # Composant racine
│   └── main.js            # Point d'entrée
├── public/                # Fichiers statiques
├── index.html             # Template HTML
├── package.json
├── vite.config.js         # Configuration Vite
└── tailwind.config.js     # Configuration Tailwind
```

## Routes

- `/admin/login` - Page de connexion admin
- `/admin/dashboard` - Dashboard principal
- `/admin/questions` - Gestion des questions
- `/admin/users` - Gestion des utilisateurs

## Authentification

Toutes les routes (sauf `/admin/login`) sont protégées par le guard `adminGuard` qui vérifie l'authentification admin via `localStorage`.

