# Pipeline CI/CD

## Vue d'ensemble

Le pipeline CI/CD est configuré avec GitHub Actions et comprend :

1. **Tests** : Tests unitaires et d'intégration
2. **Scans de sécurité** : CodeQL, Semgrep, Trivy
3. **Build Docker** : Construction des images
4. **Scan des images** : Analyse de sécurité des images Docker
5. **Push Docker Hub** : Déploiement uniquement après validation

## Workflows

### 1. Tests locaux (`local-tests.yml`)

Exécute les tests backend et frontend sur chaque push/PR.

### 2. Scans de sécurité (`security-scan.yml`)

- **CodeQL** : Analyse statique du code JavaScript
- **Semgrep** : Détection de vulnérabilités (OWASP Top 10, security-audit)
- **Trivy** : Scan des fichiers système et Dockerfiles

### 3. Pipeline principal (`ci-cd-pipeline.yml`)

1. **Tests** : Exécution de tous les tests
2. **Security Scans** : CodeQL, Semgrep, Trivy
3. **Build & Scan** : Construction et scan des images Docker
4. **Push** : Push vers Docker Hub uniquement si tout passe

## Configuration requise

### Secrets GitHub

- `DOCKER_USERNAME` : Nom d'utilisateur Docker Hub
- `DOCKER_PASSWORD` : Token Docker Hub

### Configuration

Les scans sont configurés pour bloquer sur les vulnérabilités CRITICAL et HIGH. Les résultats sont uploadés dans GitHub Security.

## Utilisation

Le pipeline s'exécute automatiquement sur :
- Push vers `main` ou `develop`
- Pull requests vers `main` ou `develop`
- Schedule hebdomadaire pour les scans de sécurité

## Résultats

Les résultats des scans sont disponibles dans :
- **GitHub Security** : Onglet "Code scanning alerts"
- **Actions** : Détails de chaque workflow run


