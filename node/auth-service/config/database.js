const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intelectgame';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected (auth-service)');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Continue even if MongoDB fails - will use fallback
    process.exit(1);
  }
};

module.exports = connectDB;









