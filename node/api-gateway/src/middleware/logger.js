// Middleware de logging des requêtes
const logger = (req, res, next) => {
  const start = Date.now();
  
  // Logger la requête entrante
  console.log(`📥 ${req.method} ${req.path} - ${req.ip}`);
  
  // Logger la réponse quand elle est envoyée
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '❌' : res.statusCode >= 300 ? '⚠️' : '✅';
    console.log(`${statusColor} ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = logger;

