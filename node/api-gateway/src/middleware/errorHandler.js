// Middleware de gestion des erreurs centralisé

const errorHandler = (err, req, res, next) => {
  console.error(`❌ API Gateway Error: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    path: req.path,
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandler;
