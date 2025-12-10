const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const SERVICES = require('../../config/services');
const router = express.Router();

// Configuration du proxy pour chaque service
const createServiceProxy = (target, pathPrefix = '') => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    // Important pour les requêtes POST/PUT avec body
    secure: false,
    ws: false, // WebSocket est géré séparément
    timeout: 30000, // Timeout de 30 secondes
    proxyTimeout: 30000,
    pathRewrite: (path, req) => {
      // http-proxy-middleware reçoit parfois le path complet avec le préfixe
      // On doit supprimer le préfixe s'il est présent avant de le réajouter
      let cleanPath = path;
      
      // Si le path commence par le préfixe, le supprimer
      if (pathPrefix && path.startsWith(pathPrefix)) {
        cleanPath = path.substring(pathPrefix.length);
      }
      
      // Réajouter le préfixe pour que le service backend le reçoive correctement
      // Le service backend attend le chemin complet avec le préfixe
      const newPath = pathPrefix ? `${pathPrefix}${cleanPath}` : cleanPath;
      console.log(`🔄 pathRewrite: '${path}' → '${newPath}' (cleanPath: '${cleanPath}', originalUrl: '${req.originalUrl}', prefix: '${pathPrefix}')`);
      return newPath;
    },
    onError: (err, req, res) => {
      console.error(`❌ Proxy error for ${req.originalUrl}:`, err.message);
      console.error(`   Target: ${target}`);
      console.error(`   Path: ${req.path}`);
      if (!res.headersSent) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'The requested service is temporarily unavailable',
          path: req.originalUrl,
          target: target
        });
      }
    },
    onProxyReq: (proxyReq, req, res) => {
      // Logger la requête proxy pour déboguer
      console.log(`🔄 Proxying ${req.method} ${req.originalUrl} → ${target}${proxyReq.path}`);
      
      // http-proxy-middleware gère automatiquement le body
      // On s'assure juste que les headers sont corrects
      if (req.headers['content-type']) {
        proxyReq.setHeader('Content-Type', req.headers['content-type']);
      }
      
      // Ajouter des headers personnalisés si nécessaire
      proxyReq.setHeader('X-Forwarded-For', req.ip);
      proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
      proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
    },
    onProxyRes: (proxyRes, req, res) => {
      // Logger les réponses si nécessaire
      if (proxyRes.statusCode >= 400) {
        console.warn(`⚠️ ${req.method} ${req.originalUrl} - ${proxyRes.statusCode}`);
      } else {
        console.log(`✅ ${req.method} ${req.originalUrl} - ${proxyRes.statusCode}`);
      }
    }
  });
};

/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test endpoint
 *     tags: [Gateway]
 *     responses:
 *       200:
 *         description: API Gateway is working
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: API Gateway is working!
 */
router.get('/test', (req, res) => {
  res.json({ message: 'API Gateway is working!' });
});

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /auth/players/register:
 *   post:
 *     summary: Register a new player
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterPlayerRequest'
 *     responses:
 *       201:
 *         description: Player registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       400:
 *         description: Name is required
 *       409:
 *         description: Player name already exists
 */
/**
 * @swagger
 * /auth/players:
 *   get:
 *     summary: Get all players
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: List of all players
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Player'
 */
/**
 * @swagger
 * /auth/players/{id}:
 *   get:
 *     summary: Get player by ID
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Player found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       404:
 *         description: Player not found
 */
// Proxy pour Auth Service
router.use('/auth', createServiceProxy(SERVICES.auth, '/auth'));

/**
 * @swagger
 * /quiz/all:
 *   get:
 *     summary: Get all questions (without answers)
 *     tags: [Quiz]
 *     responses:
 *       200:
 *         description: List of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuestionPublic'
 */
/**
 * @swagger
 * /quiz/full:
 *   get:
 *     summary: Get all questions with answers (Admin only)
 *     tags: [Quiz]
 *     responses:
 *       200:
 *         description: List of questions with answers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 */
/**
 * @swagger
 * /quiz/create:
 *   post:
 *     summary: Create a new question (Admin only)
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuestionRequest'
 *     responses:
 *       200:
 *         description: Question created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 */
/**
 * @swagger
 * /quiz/{id}:
 *   put:
 *     summary: Update a question (Admin only)
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateQuestionRequest'
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       404:
 *         description: Question not found
 */
/**
 * @swagger
 * /quiz/{id}:
 *   delete:
 *     summary: Delete a question (Admin only)
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 */
// Proxy pour Quiz Service
router.use('/quiz', createServiceProxy(SERVICES.quiz, '/quiz'));

/**
 * @swagger
 * /game/answer:
 *   post:
 *     summary: Submit an answer to a question
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnswerRequest'
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnswerResponse'
 *       400:
 *         description: Invalid request
 */
/**
 * @swagger
 * /game/score/{playerId}:
 *   get:
 *     summary: Get player score
 *     tags: [Game]
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Player score
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Score'
 */
/**
 * @swagger
 * /game/leaderboard:
 *   get:
 *     summary: Get leaderboard
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Leaderboard
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LeaderboardEntry'
 */
/**
 * @swagger
 * /game/state:
 *   get:
 *     summary: Get current game state
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Current game state
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameState'
 */
/**
 * @swagger
 * /game/code:
 *   get:
 *     summary: Get game access code
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Game code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameCodeResponse'
 */
/**
 * @swagger
 * /game/verify-code:
 *   post:
 *     summary: Verify game access code
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyCodeRequest'
 *     responses:
 *       200:
 *         description: Code verification result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyCodeResponse'
 */
/**
 * @swagger
 * /game/players/count:
 *   get:
 *     summary: Get count of connected players
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Number of connected players
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConnectedPlayersCount'
 */
/**
 * @swagger
 * /game/players:
 *   get:
 *     summary: Get list of connected players
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: List of connected players
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ConnectedPlayer'
 */
/**
 * @swagger
 * /game/start:
 *   post:
 *     summary: Start the game (Admin only)
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Game started successfully
 *       400:
 *         description: Game already started or no questions available
 */
/**
 * @swagger
 * /game/next:
 *   post:
 *     summary: Move to next question (Admin only)
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Next question loaded
 *       400:
 *         description: Game not started or no more questions
 */
/**
 * @swagger
 * /game/end:
 *   post:
 *     summary: End the game (Admin only)
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Game ended successfully
 */
/**
 * @swagger
 * /game/delete:
 *   delete:
 *     summary: Delete/reset game state (Admin only)
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Game state deleted successfully
 */
/**
 * @swagger
 * /game/results:
 *   get:
 *     summary: Get question results (Admin only)
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Question results
 */
// Proxy pour Game Service (incluant WebSocket)
router.use('/game', createServiceProxy(SERVICES.game, '/game'));

/**
 * @swagger
 * /telegram/*:
 *   get:
 *     summary: Telegram bot endpoints
 *     tags: [Telegram]
 *     description: All requests to /telegram/* are proxied to the Telegram Bot service
 */
// Proxy pour Telegram Bot (si nécessaire)
router.use('/telegram', createServiceProxy(SERVICES.telegram, '/telegram'));

/**
 * @swagger
 * /*:
 *   get:
 *     summary: Catch-all for undefined routes
 *     tags: [Gateway]
 *     responses:
 *       404:
 *         description: Route not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Not Found
 *                 message:
 *                   type: string
 *                 availableRoutes:
 *                   type: array
 *                   items:
 *                     type: string
 */
// Route catch-all pour les routes non trouvées
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      '/health',
      '/test',
      '/auth/*',
      '/quiz/*',
      '/game/*',
      '/telegram/*'
    ]
  });
});

module.exports = router;
