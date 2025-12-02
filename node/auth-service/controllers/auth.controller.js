const fs = require("fs");
const path = require("path");
const { generateToken } = require("../utils/token");

const usersPath = path.join(__dirname, "../data/users.json");

// Ensure data directory exists
const dataDir = path.dirname(usersPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function readUsers() {
    try {
        // Check if file exists, if not create it with empty array
        if (!fs.existsSync(usersPath)) {
            fs.writeFileSync(usersPath, JSON.stringify([], null, 2));
            return [];
        }
        
        const data = fs.readFileSync(usersPath, 'utf8');
        
        // If file is empty, return empty array
        if (!data.trim()) {
            return [];
        }
        
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users file:', error);
        // Return empty array if there's any parsing error
        return [];
    }
}

function writeUsers(data) {
    try {
        fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing users file:', error);
        throw error; // Re-throw to handle in calling functions
    }
}

exports.adminLogin = (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "admin") {
        return res.json({ token: generateToken("admin") });
    }

    res.status(401).json({ error: "Invalid credentials" });
};

exports.registerPlayer = (req, res) => {
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });

    try {
        const users = readUsers();
        
        // Check if player name already exists
        const existingPlayer = users.find(user => user.name === name);
        if (existingPlayer) {
            return res.status(409).json({ error: "Player name already exists" });
        }

        const newUser = { 
            id: "p" + Date.now(), 
            name: name.trim(), 
            score: 0 
        };
        users.push(newUser);
        writeUsers(users);

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error registering player:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getPlayer = (req, res) => {
    try {
        const users = readUsers();
        const player = users.find(u => u.id === req.params.id);

        if (!player) return res.status(404).json({ error: "Player not found" });

        res.json(player);
    } catch (error) {
        console.error('Error getting player:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getAllPlayers = (req, res) => {
    try {
        const users = readUsers();
        res.json(users);
    } catch (error) {
        console.error('Error getting all players:', error);
        res.status(500).json({ error: "Internal server error" });
    }
}