# Instructions pour créer la Pull Request

## URL directe pour créer la PR

🔗 **https://github.com/THISmann/vika-game/compare/main...dev-test**

## Titre de la PR

```
fix: Corrections frontend UTF-8, conflit port 8080, et configuration Traefik
```

## Description de la PR

```markdown
## Corrections apportées

### Frontend et Admin Frontend
- ✅ Utilisation de `node:20-alpine` avec volume monté pour contourner l'erreur UTF-8
- ✅ Installation avec `--legacy-peer-deps`
- ✅ Démarrage de Vite avec `--force`

### cAdvisor
- ✅ Port changé de 8080 à 8081 pour éviter le conflit avec Traefik Dashboard

### Traefik
- ✅ Label `traefik.docker.network` supprimé pour corriger la détection des services

### Docker Compose
- ✅ Configuration mise à jour pour tous les services
- ✅ Tous les services fonctionnent correctement

## Tests
- ✅ Frontend démarre correctement (Vite v7.2.4 ready)
- ✅ Admin Frontend démarre correctement (Vite v7.3.1 ready)
- ✅ Traefik route correctement vers les services
- ✅ Application accessible sur http://82.202.141.248/vika-game

## Pipeline CI/CD

Le pipeline se déclenchera automatiquement et vérifiera:
- ✅ Tests des services backend
- ✅ Tests du frontend
- ✅ Build des images Docker
- ✅ Scan de sécurité (Trivy, CodeQL, Semgrep)
```

## Vérification du pipeline

Après création de la PR, vérifiez que:
1. Le workflow `CI/CD Pipeline` se déclenche
2. Le workflow `Build and Push Docker Images` se déclenche
3. Tous les jobs passent avec succès

