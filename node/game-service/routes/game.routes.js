const router = require("express").Router();
const gameController = require("../controllers/game.controller");
// Utiliser le middleware local (copie dans le service)
const { authenticateAdmin, authenticateUser } = require("../middleware/auth.middleware");

/**
 * @swagger
 * /game/test:
 *   get:
 *     summary: Test endpoint
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Test successful
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route working well now!' });
});

/**
 * @swagger
 * /game/answer:
 *   post:
 *     summary: Submit an answer to a question
 *     tags: [Answers]
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
 *         description: Invalid request (missing fields, game not started, wrong question, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Player or question not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/answer", gameController.answerQuestion);

/**
 * @swagger
 * /game/score/{playerId}:
 *   get:
 *     summary: Get player score
 *     tags: [Scores]
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Player ID
 *     responses:
 *       200:
 *         description: Player score
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Score'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/score/:playerId", gameController.getScore);

/**
 * @swagger
 * /game/leaderboard:
 *   get:
 *     summary: Get leaderboard
 *     tags: [Scores]
 *     description: Returns the leaderboard sorted by score (descending)
 *     responses:
 *       200:
 *         description: Leaderboard
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LeaderboardEntry'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/leaderboard", gameController.leaderboard);

/**
 * @swagger
 * /game/state:
 *   get:
 *     summary: Get current game state
 *     tags: [State]
 *     responses:
 *       200:
 *         description: Current game state
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameState'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/state", gameController.getGameState);

/**
 * @swagger
 * /game/code:
 *   get:
 *     summary: Get game access code
 *     tags: [State]
 *     responses:
 *       200:
 *         description: Game code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameCodeResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/code", gameController.getGameCode);

/**
 * @swagger
 * /game/verify-code:
 *   post:
 *     summary: Verify game access code
 *     tags: [State]
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
 *       400:
 *         description: Code is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/verify-code", gameController.verifyGameCode);

/**
 * @swagger
 * /game/players/count:
 *   get:
 *     summary: Get count of connected players
 *     tags: [Players]
 *     responses:
 *       200:
 *         description: Number of connected players
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConnectedPlayersCount'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/players/count", gameController.getConnectedPlayersCount);

/**
 * @swagger
 * /game/players:
 *   get:
 *     summary: Get list of connected players
 *     tags: [Players]
 *     responses:
 *       200:
 *         description: List of connected players
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ConnectedPlayer'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/players", gameController.getConnectedPlayers);

/**
 * @swagger
 * /game/start:
 *   post:
 *     summary: Start the game (Admin only)
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Game started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StartGameResponse'
 *       400:
 *         description: Game already started or no questions available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/start", authenticateAdmin, gameController.startGame);

/**
 * @swagger
 * /game/next:
 *   post:
 *     summary: Move to next question (Admin only)
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Next question loaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NextQuestionResponse'
 *       400:
 *         description: Game not started or no more questions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/next", authenticateAdmin, gameController.nextQuestion);

/**
 * @swagger
 * /game/end:
 *   post:
 *     summary: End the game (Admin only)
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Game ended successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EndGameResponse'
 *       400:
 *         description: Game not started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/end", authenticateAdmin, gameController.endGame);

/**
 * @swagger
 * /game/delete:
 *   delete:
 *     summary: Delete/reset game state (Admin only)
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Game state deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteGameResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/delete", authenticateAdmin, gameController.deleteGame);

/**
 * @swagger
 * /game/results:
 *   get:
 *     summary: Get question results (Public)
 *     tags: [Game]
 *     description: Returns results for all questions with player answers. Accessible to all players.
 *     responses:
 *       200:
 *         description: Question results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestionResults'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/results", gameController.getQuestionResults);

// Game Sessions (Parties) routes - User or Admin
router.post("/parties", authenticateUser, gameController.createParty);
router.get("/parties", authenticateUser, gameController.getUserParties);
router.get("/parties/:partyId", authenticateUser, gameController.getParty);
router.put("/parties/:partyId", authenticateUser, gameController.updateParty);
router.delete("/parties/:partyId", authenticateUser, gameController.deleteParty);
router.post("/parties/:partyId/start", authenticateUser, gameController.startParty);

module.exports = router;