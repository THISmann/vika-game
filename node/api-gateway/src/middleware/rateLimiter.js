// Middleware de rate limiting
// Note: Pour une production réelle, utilisez redis ou un autre store distribué

const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max) => {
  return rateLimit({
    windowMs: windowMs, // par exemple, 1 minute
    max: max, // Limite chaque IP à `max` requêtes par `windowMs`
    message: {
      status: 429,
      message: 'Too many requests from this IP, please try again after a minute',
    },
    headers: true, // Envoyer les headers X-RateLimit-*
  });
};

module.exports = createRateLimiter;
