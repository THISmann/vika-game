const Question = require("../models/Question");

exports.addQuestion = async (req, res) => {
  const { question, choices, answer } = req.body;

  if (!question || !choices || !answer) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const newQuestion = new Question({
      id: "q" + Date.now(),
      question,
      choices,
      answer
    });

    await newQuestion.save();
    res.json(newQuestion.toObject());
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({ id: req.params.id });

    if (!question) return res.status(404).json({ error: "Not found" });

    // Update fields
    if (req.body.question) question.question = req.body.question;
    if (req.body.choices) question.choices = req.body.choices;
    if (req.body.answer) question.answer = req.body.answer;

    await question.save();
    res.json(question.toObject());
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({ id: req.params.id });

    if (!question) return res.status(404).json({ error: "Not found" });

    res.json({ message: "Deleted" });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({});
    res.json(questions.map(q => ({
      id: q.id,
      question: q.question,
      choices: q.choices
    })));
  } catch (error) {
    console.error('Error getting questions:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getFullQuestions = async (req, res) => {
  try {
    const questions = await Question.find({});
    res.json(questions.map(q => q.toObject()));
  } catch (error) {
    console.error('Error getting full questions:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};