# Quiz Game Application - Résumé Projet

## Description

Application de quiz interactif en temps réel développée avec une architecture microservices. Permet à un administrateur de créer et gérer des questions, et à des joueurs de participer simultanément via une interface web ou un bot Telegram.

## Technologies principales

- **Backend** : Node.js/Express (3 microservices : Auth, Quiz, Game)
- **Frontend** : Vue.js 3 avec WebSocket en temps réel
- **Base de données** : MongoDB + Redis (cache)
- **Infrastructure** : Docker, Kubernetes, Nginx
- **Communication** : REST API + WebSocket (Socket.io)
- **Monitoring** : ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tests** : Jest, Vitest
- **Documentation** : Swagger/OpenAPI

## Fonctionnalités

- Gestion des questions (CRUD avec authentification admin)
- Jeu en temps réel avec diffusion simultanée des questions
- Système de scores et classement en direct
- Interface multi-plateforme (Web + Bot Telegram)
- Monitoring et centralisation des logs

## Points techniques

Architecture microservices, authentification JWT, WebSocket pour le temps réel, déploiement Kubernetes, monitoring ELK, tests automatisés.


