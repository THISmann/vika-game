const express = require("express");
const cors = require('cors');
const app = express();
const quizRoutes = require("./routes/quiz.routes");
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

app.use("/quiz", quizRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log("Quiz service running on port " + PORT);
  console.log("📦 Redis cache: " + (process.env.REDIS_HOST ? "Enabled" : "Disabled"));
});


 