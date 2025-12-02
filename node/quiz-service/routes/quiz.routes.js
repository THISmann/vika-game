const router = require("express").Router();
const quizController = require("../controllers/quiz.controller");

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'service route working well now!' });
});

// Admin
router.post("/create", quizController.addQuestion);
router.put("/:id", quizController.updateQuestion);
router.delete("/:id", quizController.deleteQuestion);

// Player
router.get("/all", quizController.getQuestions);
router.get("/full", quizController.getFullQuestions);

module.exports = router;