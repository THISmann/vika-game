const router = require("express").Router();
const quizController = require("../controllers/quiz.controller");
// Utiliser le middleware local (copie dans le service)
const { authenticateAdmin } = require("../middleware/auth.middleware");

/**
 * @swagger
 * /quiz/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'quiz-service' });
});

/**
 * @swagger
 * /quiz/test:
 *   get:
 *     summary: Test endpoint
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: Test successful
 */
router.get('/test', (req, res) => {
  res.json({ message: 'service route working well now!' });
});

/**
 * @swagger
 * /quiz/create:
 *   post:
 *     summary: Create a new question (Admin only)
 *     tags: [Admin]
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
 *       400:
 *         description: Missing required fields
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
router.post("/create", authenticateAdmin, quizController.addQuestion);

/**
 * @swagger
 * /quiz/{id}:
 *   put:
 *     summary: Update a question (Admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateQuestionRequest'
 *     responses:
 *       200:
 *         description: Question updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       404:
 *         description: Question not found
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
router.put("/:id", authenticateAdmin, quizController.updateQuestion);

/**
 * @swagger
 * /quiz/{id}:
 *   delete:
 *     summary: Delete a question (Admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 *       404:
 *         description: Question not found
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
router.delete("/:id", authenticateAdmin, quizController.deleteQuestion);

/**
 * @swagger
 * /quiz/all:
 *   get:
 *     summary: Get all questions (without answers)
 *     tags: [Questions]
 *     description: Returns all questions without the correct answers (for players)
 *     responses:
 *       200:
 *         description: List of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuestionPublic'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/all", quizController.getQuestions);

/**
 * @swagger
 * /quiz/questions:
 *   get:
 *     summary: Get all questions (without answers) - Alias
 *     tags: [Questions]
 *     description: Alias for /quiz/all
 *     responses:
 *       200:
 *         description: List of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuestionPublic'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/questions", quizController.getQuestions); // Alias pour compatibilité

/**
 * @swagger
 * /quiz/full:
 *   get:
 *     summary: Get all questions with answers (Admin only)
 *     tags: [Admin]
 *     description: Returns all questions including the correct answers
 *     responses:
 *       200:
 *         description: List of questions with answers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/full", authenticateAdmin, quizController.getFullQuestions);

/**
 * @swagger
 * /quiz/verify/{id}:
 *   get:
 *     summary: Verify answer for a question (Public)
 *     tags: [Questions]
 *     description: Returns the correct answer for a specific question. Used by game-service to verify player answers.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question answer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 answer:
 *                   type: string
 *       404:
 *         description: Question not found
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
router.get("/verify/:id", quizController.verifyAnswer);

/**
 * @swagger
 * /quiz/user/questions:
 *   get:
 *     summary: Get questions created by the current user
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     description: Returns all questions created by the authenticated user (user or admin role)
 *     responses:
 *       200:
 *         description: List of user's questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *       401:
 *         description: Unauthorized
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
router.get("/user/questions", authenticateAdmin, quizController.getUserQuestions);

module.exports = router;