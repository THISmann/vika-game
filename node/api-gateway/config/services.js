// Configuration des URLs des microservices
// En développement local, utiliser localhost
// En Docker, utiliser les noms de services

const isDocker = process.env.DOCKER_ENV === 'true' || process.env.NODE_ENV === 'production';

const SERVICES = {
  auth: isDocker 
    ? process.env.AUTH_SERVICE_URL || 'http://auth:3001'
    : process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  
  quiz: isDocker
    ? process.env.QUIZ_SERVICE_URL || 'http://quiz:3002'
    : process.env.QUIZ_SERVICE_URL || 'http://localhost:3002',
  
  game: isDocker
    ? process.env.GAME_SERVICE_URL || 'http://game:3003'
    : process.env.GAME_SERVICE_URL || 'http://localhost:3003',
  
  telegram: isDocker
    ? process.env.TELEGRAM_SERVICE_URL || 'http://telegram-bot:3004'
    : process.env.TELEGRAM_SERVICE_URL || 'http://localhost:3004'
};

module.exports = SERVICES;

