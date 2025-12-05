// Configuration des URLs des services backend
// Utilise les variables d'environnement pour la flexibilité

const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  quiz: process.env.QUIZ_SERVICE_URL || 'http://localhost:3002',
  game: process.env.GAME_SERVICE_URL || 'http://localhost:3003',
  telegram: process.env.TELEGRAM_SERVICE_URL || 'http://localhost:3004',
};

module.exports = SERVICES;
