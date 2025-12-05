// Middleware de gestion des erreurs
const errorHandler = (err, req, res, next) => {
  console.error('❌ API Gateway Error:', {
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack
  });

  // Si la réponse a déjà été envoyée, passer au middleware suivant
  if (res.headersSent) {
    return next(err);
  }

  // Erreur de proxy
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'The requested service is temporarily unavailable',
      service: err.service || 'unknown'
    });
  }

  // Erreur 404
  if (err.statusCode === 404) {
    return res.status(404).json({
      error: 'Not Found',
      message: err.message || 'The requested resource was not found'
    });
  }

  // Erreur par défaut
  res.status(err.statusCode || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
};

module.exports = errorHandler;

