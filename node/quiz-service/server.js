const express = require("express");
const cors = require('cors');
const app = express();
const quizRoutes = require("./routes/quiz.routes");
const connectDB = require("./config/database");
const redisClient = require("./shared/redis-client");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { createLogger, requestLogger, errorLogger } = require("./shared/logger");

// Create logger instance
const logger = createLogger('quiz-service');

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

// Request logging middleware (must be before routes)
app.use(requestLogger(logger));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Quiz Service API Documentation'
}));

// Connect to MongoDB
connectDB();

// Connect to Redis (non-blocking)
redisClient.connect().catch(err => {
  console.warn('⚠️ Redis connection failed, continuing without cache:', err.message);
});

app.use("/quiz", quizRoutes);

// Error logging middleware (must be after routes, before error handlers)
app.use(errorLogger(logger));

// Global error handler
app.use((err, req, res, next) => {
  logger.logError(err, req);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  logger.info(`Quiz service started on port ${PORT}`);
  logger.info(`📦 Redis cache: ${process.env.REDIS_HOST ? "Enabled" : "Disabled"}`);
  logger.info(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
});


 