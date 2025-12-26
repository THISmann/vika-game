const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const { authenticateAdmin } = require("../middleware/auth.middleware");

/**
 * @swagger
 * /auth/test:
 *   get:
 *     summary: Test endpoint
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Test successful
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route working well now!' });
});

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
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
router.post("/admin/login", authController.adminLogin);

/**
 * @swagger
 * /auth/players/register:
 *   post:
 *     summary: Register a new player
 *     tags: [Players]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Player name already exists
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
router.post("/players/register", authController.registerPlayer);

/**
 * @swagger
 * /auth/players/{id}:
 *   get:
 *     summary: Get player by ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Player ID
 *     responses:
 *       200:
 *         description: Player found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       404:
 *         description: Player not found
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
router.get("/players/:id", authController.getPlayer);

/**
 * @swagger
 * /auth/players:
 *   get:
 *     summary: Get all players
 *     tags: [Players]
 *     responses:
 *       200:
 *         description: List of all players
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Player'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/players", authController.getAllPlayers);

/**
 * @swagger
 * /auth/verify-token:
 *   get:
 *     summary: Verify authentication token
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 role:
 *                   type: string
 *                 timestamp:
 *                   type: number
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/verify-token", authController.verifyToken);

/**
 * Admin routes - User management
 */
router.get("/admin/users", authenticateAdmin, authController.getUsers);
router.get("/admin/users/stats", authenticateAdmin, authController.getUserStats);
router.put("/admin/users/:userId/approve", authenticateAdmin, authController.approveUser);
router.put("/admin/users/:userId/reject", authenticateAdmin, authController.rejectUser);
router.put("/admin/users/:userId/block", authenticateAdmin, authController.blockUser);
router.put("/admin/users/:userId/unblock", authenticateAdmin, authController.unblockUser);

module.exports = router;