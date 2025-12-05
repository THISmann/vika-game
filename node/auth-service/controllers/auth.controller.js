const { generateToken } = require("../utils/token");
const User = require("../models/User");
const cache = require("../../shared/cache-utils");

// Clés de cache
const CACHE_KEYS = {
  PLAYER: (id) => cache.PREFIXES.AUTH + `player:${id}`,
  ALL_PLAYERS: cache.PREFIXES.AUTH + 'all-players'
};

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
        
        // Invalider le cache des joueurs
        await cache.del(CACHE_KEYS.ALL_PLAYERS);
        
        console.log('✅ Player registered and cache invalidated');
        res.status(201).json(newUser.toObject());
    } catch (error) {
        console.error('Error registering player:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getPlayer = async (req, res) => {
    try {
        const playerId = req.params.id;
        
        // Essayer de récupérer depuis le cache
        const cached = await cache.get(CACHE_KEYS.PLAYER(playerId));
        if (cached) {
            console.log('✅ Player served from cache');
            return res.json(cached);
        }
        
        const player = await User.findOne({ id: playerId });

        if (!player) return res.status(404).json({ error: "Player not found" });

        const playerObj = player.toObject();
        
        // Mettre en cache
        await cache.set(CACHE_KEYS.PLAYER(playerId), playerObj, cache.TTL.PLAYER);
        
        res.json(playerObj);
    } catch (error) {
        console.error('Error getting player:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getAllPlayers = async (req, res) => {
    try {
        // Essayer de récupérer depuis le cache
        const cached = await cache.get(CACHE_KEYS.ALL_PLAYERS);
        if (cached) {
            console.log('✅ All players served from cache');
            return res.json(cached);
        }
        
        const users = await User.find({});
        const playersData = users.map(user => user.toObject());
        
        // Mettre en cache
        await cache.set(CACHE_KEYS.ALL_PLAYERS, playersData, cache.TTL.PLAYERS_LIST);
        console.log('✅ All players fetched from DB and cached');
        
        res.json(playersData);
    } catch (error) {
        console.error('Error getting all players:', error);
        res.status(500).json({ error: "Internal server error" });
    }
}