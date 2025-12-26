const { generateToken } = require("../utils/token");
const User = require("../models/User");
const cache = require("../shared/cache-utils");
const axios = require("axios");

// Clés de cache
const CACHE_KEYS = {
  PLAYER: (id) => cache.PREFIXES.AUTH + `player:${id}`,
  ALL_PLAYERS: cache.PREFIXES.AUTH + 'all-players'
};

/**
 * Update lastLoginAt for a user
 */
async function updateLastLogin(userId) {
    try {
        await User.updateOne(
            { id: userId },
            { $set: { lastLoginAt: new Date() } }
        );
        console.log(`✅ Updated lastLoginAt for user: ${userId}`);
    } catch (error) {
        console.error(`❌ Error updating lastLoginAt for user ${userId}:`, error);
    }
}

exports.adminLogin = async (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "admin") {
        // Update lastLoginAt for admin user (using a special admin ID)
        const adminUserId = "00000000-0000-0000-0000-000000000001"; // Admin user ID
        await updateLastLogin(adminUserId);
        return res.json({ token: generateToken("admin") });
    }

    res.status(401).json({ error: "Invalid credentials" });
};

exports.registerPlayer = async (req, res) => {
    const { name, email, password, contact, useCase, country } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });

    try {
        // Check if player name already exists
        const existingPlayer = await User.findOne({ name: name.trim() });
        if (existingPlayer) {
            return res.status(409).json({ error: "Player name already exists" });
        }

        // Check if email already exists (if provided)
        if (email) {
            const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
            if (existingEmail) {
                return res.status(409).json({ error: "Email already registered" });
            }
        }

        const newUser = new User({
            id: "p" + Date.now(),
            name: name.trim(),
            email: email ? email.trim().toLowerCase() : undefined,
            password: password || undefined, // Store password if provided (should be hashed in production)
            contact: contact ? contact.trim() : undefined,
            useCase: useCase || undefined,
            country: country || undefined,
            score: 0,
            status: 'pending', // New users start as pending
            createdAt: new Date(),
            lastLoginAt: new Date() // Set initial login time on registration
        });

        await newUser.save();
        
        // Invalider le cache des joueurs
        await cache.del(CACHE_KEYS.ALL_PLAYERS);
        
        console.log('✅ Player registered with pending status and cache invalidated');
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
};

/**
 * Update lastLoginAt for a player (called by game-service when player connects)
 */
exports.updateLastLogin = async (req, res) => {
    try {
        const playerId = req.params.id;
        
        const user = await User.findOne({ id: playerId });
        if (!user) {
            return res.status(404).json({ error: "Player not found" });
        }

        user.lastLoginAt = new Date();
        await user.save();
        
        // Invalidate cache
        await cache.del(CACHE_KEYS.PLAYER(playerId));
        await cache.del(CACHE_KEYS.ALL_PLAYERS);
        
        console.log(`✅ Updated lastLoginAt for player: ${playerId}`);
        res.json({ success: true, lastLoginAt: user.lastLoginAt });
    } catch (error) {
        console.error('Error updating lastLoginAt:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Get all users with optional filters (Admin only)
 */
exports.getUsers = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 50 } = req.query;
        
        // Build query
        const query = {};
        if (status) {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { id: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        
        const total = await User.countDocuments(query);
        
        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Get analytics data for charts (Admin only)
 */
exports.getAnalytics = async (req, res) => {
    try {
        const { period = 30 } = req.query; // Default to 30 days
        const days = parseInt(period, 10) || 30;
        
        // Set startDate to beginning of day (00:00:00) to include full day
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0); // Set to beginning of day
        
        // Set endDate to end of today (23:59:59) to include today
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999); // Set to end of today
        
        // Get user registrations grouped by date
        const registrationsByDate = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: days <= 30 ? '%Y-%m-%d' : days <= 90 ? '%Y-%m-%d' : '%Y-%m',
                            date: '$createdAt'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        
        // Get user logins grouped by date (for active users)
        const loginsByDate = await User.aggregate([
            {
                $match: {
                    lastLoginAt: { 
                        $gte: startDate, 
                        $lte: endDate,
                        $ne: null 
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: days <= 30 ? '%Y-%m-%d' : days <= 90 ? '%Y-%m-%d' : '%Y-%m',
                            date: '$lastLoginAt'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        
        // Build complete date range
        const labels = [];
        const registrations = [];
        const activeUsers = [];
        const userGrowth = [];
        
        const now = new Date();
        let cumulativeUsers = 0;
        
        // Get total users before the period
        const usersBeforePeriod = await User.countDocuments({
            createdAt: { $lt: startDate }
        });
        cumulativeUsers = usersBeforePeriod;
        
        // Determine date format based on period
        const dateFormat = days <= 30 ? '%Y-%m-%d' : days <= 90 ? '%Y-%m-%d' : '%Y-%m';
        
        // Determine iteration step
        const isMonthly = days > 90;
        const iterations = isMonthly ? Math.ceil(days / 30) : days;
        
        for (let i = iterations - 1; i >= 0; i--) {
            const date = new Date(now);
            if (isMonthly) {
                date.setMonth(date.getMonth() - i);
                date.setDate(1); // First day of month
            } else {
                date.setDate(date.getDate() - i);
            }
            
            let label;
            if (days <= 30) {
                label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else if (days <= 90) {
                label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else {
                label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }
            
            let dateKey;
            if (days <= 90) {
                dateKey = date.toISOString().split('T')[0];
            } else {
                dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }
            
            labels.push(label);
            
            // Find registrations for this date
            const regData = registrationsByDate.find(r => r._id === dateKey);
            const regCount = regData ? regData.count : 0;
            registrations.push(regCount);
            
            cumulativeUsers += regCount;
            userGrowth.push(cumulativeUsers);
            
            // Find active users for this date
            const loginData = loginsByDate.find(l => l._id === dateKey);
            activeUsers.push(loginData ? loginData.count : 0);
        }
        
        // Calculate summary
        const totalUsers = await User.countDocuments();
        const newUsers = registrations.reduce((a, b) => a + b, 0);
        const totalVisits = activeUsers.reduce((a, b) => a + b, 0);
        const avgActiveUsers = Math.round(activeUsers.reduce((a, b) => a + b, 0) / activeUsers.length) || 0;
        
        res.json({
            period: days,
            summary: {
                totalUsers,
                newUsers,
                totalVisits,
                activeUsers: avgActiveUsers
            },
            charts: {
                labels,
                userGrowth,
                registrations,
                activeUsers,
                visits: activeUsers // Using active users as visits proxy
            }
        });
    } catch (error) {
        console.error('Error getting analytics:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Get user statistics for dashboard (Admin only)
 */
exports.getUserStats = async (req, res) => {
    try {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statsObj = {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            blocked: 0
        };

        stats.forEach(stat => {
            statsObj[stat._id] = stat.count;
            statsObj.total += stat.count;
        });

        // Get recent registrations (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentRegistrations = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Get game statistics from game-service
        let gameStats = {
            connectedPlayers: 0,
            gameCode: null,
            isGameStarted: false
        };

        try {
            const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://game-service:3003';
            const [connectedPlayersRes, gameStateRes] = await Promise.allSettled([
                axios.get(`${GAME_SERVICE_URL}/game/players/count`),
                axios.get(`${GAME_SERVICE_URL}/game/state`)
            ]);

            if (connectedPlayersRes.status === 'fulfilled') {
                gameStats.connectedPlayers = connectedPlayersRes.value.data.count || 0;
            }

            if (gameStateRes.status === 'fulfilled') {
                const state = gameStateRes.value.data;
                gameStats.gameCode = state.gameCode || null;
                gameStats.isGameStarted = state.isStarted || false;
            }
        } catch (error) {
            console.warn('Could not fetch game statistics:', error.message);
        }

        res.json({
            ...statsObj,
            recentRegistrations,
            game: gameStats
        });
    } catch (error) {
        console.error('Error getting user stats:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Approve a user (Admin only)
 */
exports.approveUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminUser = req.user;

        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.status = 'approved';
        user.statusChangedAt = new Date();
        user.statusChangedBy = adminUser.role || 'admin';

        await user.save();
        
        // Invalider le cache
        await cache.del(CACHE_KEYS.PLAYER(userId));
        await cache.del(CACHE_KEYS.ALL_PLAYERS);
        
        console.log(`✅ User ${userId} approved by admin`);
        res.json(user.toObject());
    } catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Reject a user (Admin only)
 */
exports.rejectUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        const adminUser = req.user;

        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.status = 'rejected';
        user.statusChangedAt = new Date();
        user.statusChangedBy = adminUser.role || 'admin';
        user.rejectionReason = reason || '';

        await user.save();
        
        // Invalider le cache
        await cache.del(CACHE_KEYS.PLAYER(userId));
        await cache.del(CACHE_KEYS.ALL_PLAYERS);
        
        console.log(`✅ User ${userId} rejected by admin`);
        res.json(user.toObject());
    } catch (error) {
        console.error('Error rejecting user:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Block a user (Admin only)
 */
exports.blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminUser = req.user;

        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.status = 'blocked';
        user.statusChangedAt = new Date();
        user.statusChangedBy = adminUser.role || 'admin';

        await user.save();
        
        // Invalider le cache
        await cache.del(CACHE_KEYS.PLAYER(userId));
        await cache.del(CACHE_KEYS.ALL_PLAYERS);
        
        console.log(`✅ User ${userId} blocked by admin`);
        res.json(user.toObject());
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Unblock a user (Admin only)
 */
exports.unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminUser = req.user;

        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Unblock means setting back to approved
        user.status = 'approved';
        user.statusChangedAt = new Date();
        user.statusChangedBy = adminUser.role || 'admin';
        user.rejectionReason = undefined;

        await user.save();
        
        // Invalider le cache
        await cache.del(CACHE_KEYS.PLAYER(userId));
        await cache.del(CACHE_KEYS.ALL_PLAYERS);
        
        console.log(`✅ User ${userId} unblocked by admin`);
        res.json(user.toObject());
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Vérifie un token d'authentification
 * Utilisé par les autres services pour valider les tokens
 */
exports.verifyToken = (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ 
                valid: false,
                error: 'No authorization header provided'
            });
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ 
                valid: false,
                error: 'Invalid authorization format'
            });
        }

        const token = parts[1];
        const { verifyToken } = require('../utils/token');
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ 
                valid: false,
                error: 'Invalid or expired token'
            });
        }

        res.json({
            valid: true,
            role: decoded.role,
            timestamp: decoded.timestamp
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ 
            valid: false,
            error: 'Internal server error'
        });
    }
}