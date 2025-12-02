const express = require("express");
const cors = require('cors');
const app = express();
const quizRoutes = require("./routes/quiz.routes");

// Enable CORS for all routes
app.use(cors());

app.use(express.json());
app.use("/quiz", quizRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log("Quiz service running on port " + PORT));


 