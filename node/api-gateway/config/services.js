// Configuration des URLs des services backend
// Utilise les variables d'environnement pour la flexibilité
// Si DOCKER_ENV=true, utilise les noms de service Docker, sinon utilise localhost

const isDockerEnv = process.env.DOCKER_ENV === 'true';

const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || (isDockerEnv ? 'http://auth:3001' : 'http://localhost:3001'),
  quiz: process.env.QUIZ_SERVICE_URL || (isDockerEnv ? 'http://quiz:3002' : 'http://localhost:3002'),
  game: process.env.GAME_SERVICE_URL || (isDockerEnv ? 'http://game:3003' : 'http://localhost:3003'),
  telegram: process.env.TELEGRAM_SERVICE_URL || (isDockerEnv ? 'http://telegram-bot:3004' : 'http://localhost:3004'),
};

module.exports = SERVICES;
