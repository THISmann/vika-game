const express = require("express");
const app = express();
const authRoutes = require("./routes/auth.routes");
const cors = require('cors');

// Enable CORS for all routes
app.use(cors());
 
app.use(express.json());
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Auth service running on port " + PORT));