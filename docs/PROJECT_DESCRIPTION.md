# Description du Projet - Quiz Game Application

## Vue d'ensemble

Application de quiz interactif en temps réel permettant à un administrateur de créer et gérer des questions, et à des joueurs de participer via une interface web ou un bot Telegram. Le système utilise une architecture microservices pour garantir la scalabilité et la maintenabilité.

## Architecture technique

### Backend - Microservices (Node.js/Express)
- **Auth Service** : Gestion de l'authentification JWT, inscription des joueurs
- **Quiz Service** : CRUD des questions, API REST avec Swagger
- **Game Service** : Logique métier du jeu, gestion des scores, WebSocket (Socket.io)

### Frontend
- **Vue.js 3** avec Composition API
- Interface admin pour la gestion des questions et le contrôle du jeu
- Interface joueur pour la participation en temps réel
- Communication WebSocket pour les mises à jour instantanées

### Infrastructure
- **Docker** : Containerisation de tous les services
- **Kubernetes (Minikube)** : Orchestration et déploiement en production
- **Nginx** : Reverse proxy et routage des requêtes
- **MongoDB** : Base de données NoSQL pour la persistance
- **Redis** : Cache distribué pour optimiser les performances
- **ELK Stack** : Centralisation des logs et monitoring (Elasticsearch, Logstash, Kibana)

### Intégrations
- **Bot Telegram** : Interface alternative pour les joueurs via Telegram Bot API
- **WebSocket (Socket.io)** : Communication bidirectionnelle en temps réel
- **Swagger/OpenAPI** : Documentation interactive des APIs

## Fonctionnalités principales

1. **Gestion des questions** : CRUD complet avec authentification admin
2. **Jeu en temps réel** : Questions diffusées simultanément à tous les joueurs via WebSocket
3. **Système de scores** : Calcul automatique, classement en direct
4. **Multi-plateforme** : Interface web et bot Telegram
5. **Monitoring** : Logs centralisés et dashboards Kibana
6. **Tests** : Suite de tests unitaires et d'intégration (Jest, Vitest)

## Stack technique

- **Backend** : Node.js, Express.js, Socket.io
- **Frontend** : Vue.js 3, Vite, Axios
- **Base de données** : MongoDB, Redis
- **DevOps** : Docker, Kubernetes, Nginx
- **Monitoring** : ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tests** : Jest, Vitest, Supertest
- **Documentation** : Swagger/OpenAPI

## Points techniques remarquables

- Architecture microservices avec communication inter-services via HTTP et WebSocket
- Authentification JWT avec middleware de sécurité sur les routes admin
- Gestion d'état distribuée avec synchronisation en temps réel
- Déploiement cloud-ready avec Kubernetes et configuration Nginx avancée
- Monitoring et observabilité avec centralisation des logs
- Tests automatisés pour garantir la qualité du code


