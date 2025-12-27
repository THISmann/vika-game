/**
 * Prometheus metrics middleware for API Gateway
 */

const promClient = require('prom-client');

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// HTTP Request Duration Histogram
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
});

// HTTP Request Total Counter
const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service']
});

// HTTP Request Errors Counter
const httpRequestErrors = new promClient.Counter({
  name: 'http_request_errors_total',
  help: 'Total number of HTTP request errors',
  labelNames: ['method', 'route', 'status_code', 'service', 'error_type']
});

// Active Connections Gauge
const activeConnections = new promClient.Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
  labelNames: ['service']
});

// Response Size Histogram
const httpResponseSize = new promClient.Histogram({
  name: 'http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [100, 1000, 10000, 100000, 1000000]
});

// Register all custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(httpRequestErrors);
register.registerMetric(activeConnections);
register.registerMetric(httpResponseSize);

/**
 * Middleware to collect HTTP metrics
 */
function metricsMiddleware(req, res, next) {
  const startTime = Date.now();
  const route = req.route?.path || req.path || 'unknown';
  const method = req.method;
  
  // Increment active connections
  activeConnections.inc({ service: 'api-gateway' });

  // Track response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    const statusCode = res.statusCode || 200;
    // Convert content-length to number if it exists, otherwise calculate from chunk
    const contentLength = res.get('content-length');
    let responseSize = 0;
    if (contentLength) {
      const parsed = parseInt(contentLength, 10);
      responseSize = isNaN(parsed) ? 0 : parsed;
    } else if (chunk) {
      responseSize = Buffer.byteLength(chunk);
    }
    
    // Ensure responseSize is a valid number
    if (typeof responseSize !== 'number' || isNaN(responseSize)) {
      responseSize = 0;
    }
    
    // Convert statusCode to string for labels (Prometheus labels must be strings)
    const statusCodeStr = String(statusCode);
    
    // Record metrics
    httpRequestDuration.observe({ method, route, status_code: statusCodeStr, service: 'api-gateway' }, duration);
    httpRequestTotal.inc({ method, route, status_code: statusCodeStr, service: 'api-gateway' });
    httpResponseSize.observe({ method, route, status_code: statusCodeStr, service: 'api-gateway' }, responseSize);
    
    // Record errors
    if (statusCode >= 400) {
      const errorType = statusCode >= 500 ? 'server_error' : statusCode >= 400 ? 'client_error' : 'unknown';
      httpRequestErrors.inc({ method, route, status_code: statusCodeStr, service: 'api-gateway', error_type: errorType });
    }
    
    // Decrement active connections
    activeConnections.dec({ service: 'api-gateway' });
    
    originalEnd.call(this, chunk, encoding);
  };

  next();
}

/**
 * Error tracking middleware
 */
function trackError(error, req) {
  const route = req.route?.path || req.path || 'unknown';
  const method = req.method || 'unknown';
  const errorType = error.name || 'unknown_error';
  
  httpRequestErrors.inc({
    method,
    route,
    status_code: 500,
    service: 'api-gateway',
    error_type: errorType
  });
}

/**
 * Get metrics endpoint handler
 */
async function getMetrics(req, res) {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end(error.message);
  }
}

module.exports = {
  metricsMiddleware,
  trackError,
  getMetrics,
  register,
  httpRequestDuration,
  httpRequestTotal,
  httpRequestErrors,
  activeConnections,
  httpResponseSize
};

