// Configuration des URLs des services
// Utilise les variables d'environnement ou des valeurs par défaut

module.exports = {
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  QUIZ_SERVICE_URL: process.env.QUIZ_SERVICE_URL || 'http://quiz-service:3002',
};










