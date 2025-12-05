const express = require("express");
const app = express();
const authRoutes = require("./routes/auth.routes");
const cors = require('cors');
const connectDB = require("./config/database");
const redisClient = require("../shared/redis-client");

// Enable CORS for all routes
app.use(cors());
 
app.use(express.json());

// Connect to MongoDB
connectDB();

// Connect to Redis (non-blocking)
redisClient.connect().catch(err => {
  console.warn('⚠️ Redis connection failed, continuing without cache:', err.message);
});

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Auth service running on port " + PORT);
  console.log("📦 Redis cache: " + (process.env.REDIS_HOST ? "Enabled" : "Disabled"));
});