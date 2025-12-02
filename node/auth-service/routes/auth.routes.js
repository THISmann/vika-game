const router = require("express").Router();
const authController = require("../controllers/auth.controller");

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route working well now!' });
});
router.post("/admin/login", authController.adminLogin);
router.post("/players/register", authController.registerPlayer);
router.get("/players/:id", authController.getPlayer);
router.get("/players", authController.getAllPlayers);

module.exports = router;