const { generateToken } = require("../utils/token");
const User = require("../models/User");

exports.adminLogin = (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "admin") {
        return res.json({ token: generateToken("admin") });
    }

    res.status(401).json({ error: "Invalid credentials" });
};

exports.registerPlayer = async (req, res) => {
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });

    try {
        // Check if player name already exists
        const existingPlayer = await User.findOne({ name: name.trim() });
        if (existingPlayer) {
            return res.status(409).json({ error: "Player name already exists" });
        }

        const newUser = new User({
            id: "p" + Date.now(),
            name: name.trim(),
            score: 0
        });

        await newUser.save();
        res.status(201).json(newUser.toObject());
    } catch (error) {
        console.error('Error registering player:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getPlayer = async (req, res) => {
    try {
        const player = await User.findOne({ id: req.params.id });

        if (!player) return res.status(404).json({ error: "Player not found" });

        res.json(player.toObject());
    } catch (error) {
        console.error('Error getting player:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getAllPlayers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users.map(user => user.toObject()));
    } catch (error) {
        console.error('Error getting all players:', error);
        res.status(500).json({ error: "Internal server error" });
    }
}