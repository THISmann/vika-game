const fs = require("fs");
const path = require("path");

const questionsPath = path.join(__dirname, "../data/questions.json");

function readQuestions() {
  return JSON.parse(fs.readFileSync(questionsPath));
}

function writeQuestions(data) {
  fs.writeFileSync(questionsPath, JSON.stringify(data, null, 2));
}

exports.addQuestion = (req, res) => {
  const { question, choices, answer } = req.body;

  if (!question || !choices || !answer) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const questions = readQuestions();
  const newQuestion = { id: "q" + Date.now(), question, choices, answer };
  questions.push(newQuestion);
  writeQuestions(questions);

  res.json(newQuestion);
};

exports.updateQuestion = (req, res) => {
  const questions = readQuestions();
  const index = questions.findIndex(q => q.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: "Not found" });

  questions[index] = { ...questions[index], ...req.body };
  writeQuestions(questions);

  res.json(questions[index]);
};

exports.deleteQuestion = (req, res) => {
  let questions = readQuestions();
  questions = questions.filter(q => q.id !== req.params.id);
  writeQuestions(questions);

  res.json({ message: "Deleted" });
};

exports.getQuestions = (req, res) => {
  const questions = readQuestions().map(q => ({
    id: q.id,
    question: q.question,
    choices: q.choices
  }));

  res.json(questions);
};

exports.getFullQuestions = (req, res) => {
  res.json(readQuestions());
};