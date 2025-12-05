// Middleware de rate limiting simple
// En production, utiliser express-rate-limit ou un service dédié

const rateLimitStore = new Map();

const rateLimiter = (windowMs = 60000, maxRequests = 100) => {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitStore.has(clientId)) {
      rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const clientData = rateLimitStore.get(clientId);
    
    // Réinitialiser si la fenêtre est expirée
    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
      return next();
    }
    
    // Vérifier la limite
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
    
    // Incrémenter le compteur
    clientData.count++;
    next();
  };
};

module.exports = rateLimiter;

