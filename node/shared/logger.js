/**
 * Logger utility for all services
 * Provides structured logging for API requests, responses, and errors
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.logDir = path.join(__dirname, '..', '..', 'logs');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    // Log file paths
    this.logFile = path.join(this.logDir, `${serviceName}.log`);
    this.errorLogFile = path.join(this.logDir, `${serviceName}-errors.log`);
  }

  /**
   * Format timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Format log entry
   */
  formatLog(level, message, data = {}) {
    const timestamp = this.getTimestamp();
    const logEntry = {
      timestamp,
      service: this.serviceName,
      level,
      message,
      ...data
    };
    return JSON.stringify(logEntry);
  }

  /**
   * Write to log file
   */
  writeToFile(filePath, logEntry) {
    try {
      fs.appendFileSync(filePath, logEntry + '\n', 'utf8');
    } catch (error) {
      console.error(`Failed to write to log file ${filePath}:`, error);
    }
  }

  /**
   * Log info message
   */
  info(message, data = {}) {
    const logEntry = this.formatLog('INFO', message, data);
    console.log(`[${this.serviceName}] ${message}`, data);
    this.writeToFile(this.logFile, logEntry);
  }

  /**
   * Log warning message
   */
  warn(message, data = {}) {
    const logEntry = this.formatLog('WARN', message, data);
    console.warn(`[${this.serviceName}] ⚠️ ${message}`, data);
    this.writeToFile(this.logFile, logEntry);
  }

  /**
   * Log error message
   */
  error(message, error = null, data = {}) {
    const errorData = {
      ...data,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : null
    };
    const logEntry = this.formatLog('ERROR', message, errorData);
    console.error(`[${this.serviceName}] ❌ ${message}`, error || data);
    this.writeToFile(this.logFile, logEntry);
    this.writeToFile(this.errorLogFile, logEntry);
  }

  /**
   * Log debug message (only in development)
   */
  debug(message, data = {}) {
    if (process.env.NODE_ENV !== 'production') {
      const logEntry = this.formatLog('DEBUG', message, data);
      console.debug(`[${this.serviceName}] 🔍 ${message}`, data);
      this.writeToFile(this.logFile, logEntry);
    }
  }

  /**
   * Log API request
   */
  logRequest(req, res, responseTime = null) {
    const requestData = {
      method: req.method,
      path: req.path,
      url: req.url,
      query: req.query,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
      userId: req.user?.userId || req.user?.id || null,
      role: req.user?.role || null,
      statusCode: res.statusCode,
      responseTime: responseTime ? `${responseTime}ms` : null
    };

    // Log body for POST/PUT/PATCH (but exclude sensitive data)
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const body = { ...req.body };
      // Remove sensitive fields
      if (body.password) body.password = '[REDACTED]';
      if (body.token) body.token = '[REDACTED]';
      requestData.body = body;
    }

    const level = res.statusCode >= 400 ? 'error' : res.statusCode >= 300 ? 'warn' : 'info';
    const message = `${req.method} ${req.path} ${res.statusCode}`;

    if (level === 'error') {
      this.error(message, null, requestData);
    } else if (level === 'warn') {
      this.warn(message, requestData);
    } else {
      this.info(message, requestData);
    }
  }

  /**
   * Log API error
   */
  logError(error, req = null) {
    const errorData = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    };

    if (req) {
      errorData.request = {
        method: req.method,
        path: req.path,
        url: req.url,
        ip: req.ip || req.socket.remoteAddress,
        userId: req.user?.userId || req.user?.id || null
      };
    }

    this.error('API Error', error, errorData);
  }
}

/**
 * Create logger instance for a service
 */
function createLogger(serviceName) {
  return new Logger(serviceName);
}

/**
 * Express middleware for request logging
 */
function requestLogger(logger) {
  return (req, res, next) => {
    const startTime = Date.now();

    // Log request start
    logger.debug('Request received', {
      method: req.method,
      path: req.path,
      ip: req.ip || req.socket.remoteAddress
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const responseTime = Date.now() - startTime;
      logger.logRequest(req, res, responseTime);
      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

/**
 * Express middleware for error logging
 */
function errorLogger(logger) {
  return (err, req, res, next) => {
    logger.logError(err, req);
    next(err);
  };
}

module.exports = {
  createLogger,
  requestLogger,
  errorLogger,
  Logger
};







