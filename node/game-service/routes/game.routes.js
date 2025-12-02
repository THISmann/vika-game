const router = require("express").Router();
const gameController = require("../controllers/game.controller");

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route working well now!' });
});

router.post("/answer", gameController.answerQuestion);
router.get("/score/:playerId", gameController.getScore);
router.get("/leaderboard", gameController.leaderboard);
router.get("/state", gameController.getGameState);
router.get("/players/count", gameController.getConnectedPlayersCount);
router.post("/start", gameController.startGame);
router.post("/next", gameController.nextQuestion);
router.post("/end", gameController.endGame);
router.delete("/delete", gameController.deleteGame);
router.get("/results", gameController.getQuestionResults);

module.exports = router;