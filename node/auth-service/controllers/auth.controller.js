const { generateToken } = require("../utils/token");
const User = require("../models/User");
const cache = require("../shared/cache-utils");
const axios = require("axios");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

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
        const adminUserId = "00000000-0000-0000-0000-000000000001"; // Admin user ID
        
        // Find or create admin user
        let adminUser = await User.findOne({ id: adminUserId });
        if (!adminUser) {
            // Hash admin password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash("admin", saltRounds);
            
            adminUser = new User({
                id: adminUserId,
                name: "Admin",
                email: "admin@vika-game.com",
                password: hashedPassword,
                role: 'admin',
                status: 'approved',
                createdAt: new Date(),
                lastLoginAt: new Date()
            });
            await adminUser.save();
            console.log('✅ Admin user created');
        } else {
            // Update lastLoginAt
            adminUser.lastLoginAt = new Date();
            await adminUser.save();
        }
        
        return res.json({ token: generateToken(adminUserId, "admin") });
    }

    res.status(401).json({ error: "Invalid credentials" });
};

exports.registerPlayer = async (req, res) => {
    const { name, email, password, contact, useCase, country, gameCode } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });

    try {
        // If gameCode is provided, check if name exists in current game session
        if (gameCode) {
            try {
                const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3003';
                const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
                
                // Get connected players for this game code
                const gameStateRes = await axios.get(`${GAME_SERVICE_URL}/game/state`);
                const gameState = gameStateRes.data;
                
                // Only check if the game code matches and game hasn't started
                if (gameState.gameCode === gameCode.toUpperCase() && !gameState.isStarted) {
                    // Get list of connected player IDs
                    const connectedPlayerIds = gameState.connectedPlayers || [];
                    
                    if (connectedPlayerIds.length > 0) {
                        // Get player names from auth service
                        const playersRes = await axios.get(`${AUTH_SERVICE_URL}/auth/players`);
                        const connectedPlayers = playersRes.data.filter(p => connectedPlayerIds.includes(p.id));
                        
                        // Check if name already exists in connected players
                        const nameExists = connectedPlayers.some(p => p.name && p.name.trim().toLowerCase() === name.trim().toLowerCase());
                        if (nameExists) {
                            return res.status(409).json({ error: "Ce nom est déjà utilisé dans cette partie" });
                        }
                    }
                }
            } catch (gameServiceError) {
                // If game service is unavailable, allow registration (fail open)
                console.warn("Could not check name in game service, allowing registration:", gameServiceError.message);
            }
        }
        
        // Allow same name in different games - only check within the same game session

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
            role: 'player', // Players have role 'player'
            score: 0,
            status: 'approved', // Players are auto-approved (they just play)
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
 * Delete a player by ID (called by game-service when game ends or is deleted)
 */
exports.deletePlayer = async (req, res) => {
    try {
        const playerId = req.params.id;
        
        const user = await User.findOne({ id: playerId });
        if (!user) {
            // Player not found, return success (idempotent)
            return res.json({ success: true, message: "Player not found, already deleted" });
        }

        // Only delete players (not users or admins)
        if (user.role !== 'player') {
            return res.status(403).json({ error: "Cannot delete non-player users" });
        }

        await User.deleteOne({ id: playerId });
        
        // Invalidate cache
        await cache.del(CACHE_KEYS.PLAYER(playerId));
        await cache.del(CACHE_KEYS.ALL_PLAYERS);
        
        console.log(`✅ Deleted player: ${playerId}`);
        res.json({ success: true, message: "Player deleted successfully" });
    } catch (error) {
        console.error('Error deleting player:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Register a new user (not a player) - requires email and password
 */
exports.registerUser = async (req, res) => {
    const { name, email, password, contact, useCase, country } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!password) return res.status(400).json({ error: "Password is required" });

    try {
        // Check if user name already exists
        const existingUser = await User.findOne({ name: name.trim() });
        if (existingUser) {
            return res.status(409).json({ error: "User name already exists" });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
        if (existingEmail) {
            return res.status(409).json({ error: "Email already registered" });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            id: "u" + Date.now(),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            contact: contact ? contact.trim() : undefined,
            useCase: useCase || undefined,
            country: country || undefined,
            role: 'user', // Users have role 'user'
            score: 0,
            status: 'pending', // Users need admin approval
            createdAt: new Date(),
            lastLoginAt: null // Will be set on first login
        });

        await newUser.save();
        
        // Invalidate cache
        await cache.del(CACHE_KEYS.ALL_PLAYERS);
        
        console.log('✅ User registered with pending status');
        res.status(201).json(newUser.toObject());
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * User login (for users, not admin)
 */
exports.userLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // Find user by email and include password
        const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
        
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check if user is a player (should use player registration)
        if (user.role === 'player') {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check user status
        if (user.status === 'blocked') {
            return res.status(403).json({ error: "Your account has been blocked" });
        }

        if (user.status === 'rejected') {
            return res.status(403).json({ 
                error: "Your account has been rejected",
                reason: user.rejectionReason || "No reason provided"
            });
        }

        // Update lastLoginAt
        user.lastLoginAt = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user.id, user.role);

        // Return user info (without password) and token
        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.resetPasswordToken;
        delete userObj.resetPasswordExpires;

        res.json({
            token,
            user: userObj
        });
    } catch (error) {
        console.error('Error in user login:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Request password reset (forgot password)
 */
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        
        // Don't reveal if user exists or not (security best practice)
        if (!user || user.role === 'player') {
            return res.json({ 
                message: "If an account exists with this email, a password reset link has been sent" 
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date();
        resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // In production, send email with reset link
        // For now, we'll return the token in development (remove in production!)
        console.log(`🔐 Password reset token for ${user.email}: ${resetToken}`);
        
        res.json({ 
            message: "If an account exists with this email, a password reset link has been sent",
            // Remove this in production - only for development
            resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });
    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Reset password with token
 */
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        }).select('+password');

        if (!user) {
            return res.status(400).json({ error: "Invalid or expired reset token" });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password has been reset successfully" });
    } catch (error) {
        console.error('Error in reset password:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Get all users (not players) with optional filters (Admin only)
 */
exports.getUsers = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 50, role } = req.query;
        
        // First, migrate old documents without role field
        // Documents with email are likely users, without email are players
        await User.updateMany(
            { role: { $exists: false }, email: { $exists: true, $ne: null } },
            { $set: { role: 'user' } }
        );
        await User.updateMany(
            { role: { $exists: false }, email: { $exists: false } },
            { $set: { role: 'player' } }
        );
        await User.updateMany(
            { role: { $exists: false } },
            { $set: { role: 'player' } }
        );
        
        // Build query - exclude players by default, only show users and admins
        const query = {};
        
        // Role filter
        if (role) {
            query.role = role;
        } else {
            // Default: show only users and admins, not players
            query.role = { $in: ['user', 'admin'] };
        }
        
        // Status filter
        if (status) {
            query.status = status;
        }
        
        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { id: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        console.log('🔍 getUsers query:', JSON.stringify(query, null, 2));
        
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        
        console.log(`📊 Found ${users.length} users`);
        
        // Remove passwords from response
        const usersWithoutPasswords = users.map(user => {
            const userObj = { ...user };
            delete userObj.password;
            return userObj;
        });
        
        const total = await User.countDocuments(query);
        
        res.json({
            users: usersWithoutPasswords,
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
 * Get user activities (last logins, game sessions, etc.) (Admin only)
 */
exports.getUserActivities = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Get user activities
        const activities = [];
        
        // Add registration activity
        if (user.createdAt) {
            activities.push({
                type: 'registration',
                date: user.createdAt,
                description: 'User registered on the platform'
            });
        }
        
        // Add last login activity
        if (user.lastLoginAt) {
            activities.push({
                type: 'login',
                date: user.lastLoginAt,
                description: 'Last login'
            });
        }
        
        // Add status change activities
        if (user.statusChangedAt) {
            activities.push({
                type: 'status_change',
                date: user.statusChangedAt,
                description: `Status changed to ${user.status} by ${user.statusChangedBy || 'admin'}`,
                status: user.status,
                changedBy: user.statusChangedBy
            });
        }

        // Sort by date (most recent first)
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            userId: user.id,
            userName: user.name,
            activities: activities.slice(0, 20) // Last 20 activities
        });
    } catch (error) {
        console.error('Error getting user activities:', error);
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
        
        // Get user registrations grouped by date (only users and admins, not players)
        const registrationsByDate = await User.aggregate([
            {
                $match: {
                    role: { $in: ['user', 'admin'] },
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
        
        // Get user logins grouped by date (for active users - only users and admins, not players)
        const loginsByDate = await User.aggregate([
            {
                $match: {
                    role: { $in: ['user', 'admin'] },
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
        
        // Get total users before the period (only users and admins, not players)
        const usersBeforePeriod = await User.countDocuments({
            role: { $in: ['user', 'admin'] },
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
        
        // Calculate summary (only users and admins, not players)
        const totalUsers = await User.countDocuments({
            role: { $in: ['user', 'admin'] }
        });
        // Count total players (role: 'player')
        const totalPlayers = await User.countDocuments({
            role: 'player'
        });
        const newUsers = registrations.reduce((a, b) => a + b, 0);
        const totalVisits = activeUsers.reduce((a, b) => a + b, 0);
        const avgActiveUsers = Math.round(activeUsers.reduce((a, b) => a + b, 0) / activeUsers.length) || 0;
        
        res.json({
            period: days,
            summary: {
                totalUsers,
                totalPlayers,
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
 * Only counts users (role: 'user' or 'admin'), not players
 */
exports.getUserStats = async (req, res) => {
    try {
        // Only count users and admins, not players
        const stats = await User.aggregate([
            {
                $match: {
                    role: { $in: ['user', 'admin'] }
                }
            },
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

        // Get recent user registrations (last 7 days) - only users and admins
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentRegistrations = await User.countDocuments({
            role: { $in: ['user', 'admin'] },
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
 * Update user role (Admin only)
 */
exports.updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        const adminUser = req.user;

        if (!role) {
            return res.status(400).json({ error: "Role is required" });
        }

        // Validate role
        if (!['player', 'user', 'admin'].includes(role)) {
            return res.status(400).json({ error: "Invalid role. Must be 'player', 'user', or 'admin'" });
        }

        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Prevent changing role of the current admin user (security)
        if (user.id === adminUser.userId && role !== 'admin') {
            return res.status(400).json({ error: "You cannot change your own role" });
        }

        // Update role
        const oldRole = user.role;
        user.role = role;
        
        // If changing to admin, automatically approve
        if (role === 'admin' && user.status !== 'approved') {
            user.status = 'approved';
            user.statusChangedAt = new Date();
            user.statusChangedBy = adminUser.role || 'admin';
        }

        await user.save();
        
        // Invalidate cache
        await cache.del(CACHE_KEYS.PLAYER(userId));
        await cache.del(CACHE_KEYS.ALL_PLAYERS);
        
        console.log(`✅ User ${userId} role changed from ${oldRole} to ${role} by admin`);
        res.json({
            ...user.toObject(),
            previousRole: oldRole
        });
    } catch (error) {
        console.error('Error updating user role:', error);
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
            userId: decoded.userId,
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