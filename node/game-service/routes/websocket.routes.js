const router = require("express").Router();

/**
 * @swagger
 * /game/websocket/info:
 *   get:
 *     summary: Get WebSocket connection information
 *     tags: [WebSocket]
 *     description: Returns information about WebSocket connection and available events
 *     responses:
 *       200:
 *         description: WebSocket information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "http://localhost:3003"
 *                 path:
 *                   type: string
 *                   example: "/socket.io"
 *                 transports:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["polling", "websocket"]
 *                 events:
 *                   type: object
 *                   properties:
 *                     clientToServer:
 *                       type: object
 *                       description: Events emitted by client
 *                       properties:
 *                         register:
 *                           type: object
 *                           description: Register a player for real-time updates
 *                           properties:
 *                             payload:
 *                               type: string
 *                               example: "playerId"
 *                             description:
 *                               type: string
 *                               example: "Player ID to register"
 *                     serverToClient:
 *                       type: object
 *                       description: Events emitted by server
 *                       properties:
 *                         game:code:
 *                           type: object
 *                           description: Game code received after registration
 *                         game:started:
 *                           type: object
 *                           description: Game started event
 *                         question:next:
 *                           type: object
 *                           description: Next question event
 *                         players:count:
 *                           type: object
 *                           description: Players count update
 *                         score:update:
 *                           type: object
 *                           description: Score update for a player
 *                         leaderboard:update:
 *                           type: object
 *                           description: Leaderboard update
 *                         game:ended:
 *                           type: object
 *                           description: Game ended event
 *                         error:
 *                           type: object
 *                           description: Error event
 */
router.get("/websocket/info", (req, res) => {
  res.json({
    url: process.env.GAME_SERVICE_URL || "http://localhost:3003",
    path: "/socket.io",
    transports: ["polling", "websocket"],
    documentation: "/WEBSOCKET_DOCUMENTATION.md",
    events: {
      clientToServer: {
        register: {
          description: "Register a player for real-time updates",
          payload: "playerId (string) - Player ID to register",
          example: "socket.emit('register', 'p1234567890')"
        }
      },
      serverToClient: {
        "game:code": {
          description: "Game code received after registration",
          payload: { gameCode: "string" },
          example: { gameCode: "ABC123" }
        },
        "game:started": {
          description: "Game started event",
          payload: {
            questionIndex: "number",
            totalQuestions: "number",
            gameCode: "string"
          },
          example: {
            questionIndex: 0,
            totalQuestions: 10,
            gameCode: "ABC123"
          }
        },
        "question:next": {
          description: "Next question event",
          payload: {
            question: {
              id: "string",
              question: "string",
              choices: "array"
            },
            questionIndex: "number",
            totalQuestions: "number",
            startTime: "number",
            duration: "number"
          }
        },
        "players:count": {
          description: "Players count update",
          payload: { count: "number" },
          example: { count: 5 }
        },
        "score:update": {
          description: "Score update for a player",
          payload: {
            playerId: "string",
            score: "number"
          },
          example: {
            playerId: "p1234567890",
            score: 5
          }
        },
        "leaderboard:update": {
          description: "Leaderboard update",
          payload: "array of LeaderboardEntry",
          example: [
            {
              playerId: "p1234567890",
              playerName: "Alice",
              score: 5
            }
          ]
        },
        "game:ended": {
          description: "Game ended event",
          payload: {
            message: "string",
            leaderboard: "array"
          }
        },
        "error": {
          description: "Error event",
          payload: {
            code: "string",
            message: "string"
          },
          errorCodes: [
            "GAME_ALREADY_STARTED",
            "INVALID_PLAYER_ID",
            "REGISTRATION_ERROR"
          ]
        }
      }
    }
  });
});

module.exports = router;

