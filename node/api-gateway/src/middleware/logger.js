// Middleware de logging des requêtes pour API Gateway
const { createLogger, requestLogger, errorLogger } = require("../../shared/logger");

// Create logger instance
const logger = createLogger('api-gateway');

// Request logging middleware
const requestLoggerMiddleware = requestLogger(logger);

// Error logging middleware
const errorLoggerMiddleware = errorLogger(logger);

module.exports = requestLoggerMiddleware;
module.exports.errorLogger = errorLoggerMiddleware;
module.exports.logger = logger;
