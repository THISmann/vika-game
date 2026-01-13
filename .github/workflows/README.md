# GitHub Actions Workflows

## Workflows disponibles

### 1. `ci-cd-pipeline.yml`
Pipeline principal CI/CD qui :
- Exécute les tests (backend + frontend)
- Effectue les scans de sécurité (CodeQL, Semgrep, Trivy)
- Construit les images Docker
- Scanne les images Docker avec Trivy
- Push vers Docker Hub uniquement si tout passe

### 2. `local-tests.yml`
Tests locaux qui s'exécutent sur chaque push/PR :
- Tests backend (auth, quiz, game services)
- Tests frontend
- Build frontend

### 3. `security-scan.yml`
Scans de sécurité automatisés :
- CodeQL Analysis (JavaScript)
- Semgrep (OWASP Top 10, security-audit)
- Trivy Filesystem Scan
- Trivy Dockerfile Scan

## Configuration

### Secrets requis

Dans les paramètres GitHub du repository, ajouter :

- `DOCKER_USERNAME` : Votre nom d'utilisateur Docker Hub
- `DOCKER_PASSWORD` : Votre token Docker Hub (pas le mot de passe)

### Déclencheurs

Les workflows s'exécutent automatiquement sur :
- Push vers `main` ou `develop`
- Pull requests vers `main` ou `develop`
- Schedule hebdomadaire (security-scan.yml)

## Résultats

Les résultats sont disponibles dans :
- **Actions** : Onglet GitHub Actions
- **Security** : Onglet "Code scanning alerts" pour les vulnérabilités
- **Docker Hub** : Images pushées après validation
