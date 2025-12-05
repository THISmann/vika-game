const Question = require("../models/Question");
const cache = require("../../shared/cache-utils");

// Clés de cache
const CACHE_KEYS = {
  ALL_QUESTIONS: cache.PREFIXES.QUIZ + 'all',
  FULL_QUESTIONS: cache.PREFIXES.QUIZ + 'full',
  QUESTION: (id) => cache.PREFIXES.QUIZ + `question:${id}`
};

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
    
    // Invalider le cache des questions
    await cache.del(CACHE_KEYS.ALL_QUESTIONS);
    await cache.del(CACHE_KEYS.FULL_QUESTIONS);
    
    console.log('✅ Question added and cache invalidated');
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
    
    // Invalider le cache
    await cache.del(CACHE_KEYS.ALL_QUESTIONS);
    await cache.del(CACHE_KEYS.FULL_QUESTIONS);
    await cache.del(CACHE_KEYS.QUESTION(req.params.id));
    
    console.log('✅ Question updated and cache invalidated');
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

    // Invalider le cache
    await cache.del(CACHE_KEYS.ALL_QUESTIONS);
    await cache.del(CACHE_KEYS.FULL_QUESTIONS);
    await cache.del(CACHE_KEYS.QUESTION(req.params.id));
    
    console.log('✅ Question deleted and cache invalidated');
    res.json({ message: "Deleted" });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    // Essayer de récupérer depuis le cache
    const cached = await cache.get(CACHE_KEYS.ALL_QUESTIONS);
    if (cached) {
      console.log('✅ Questions served from cache');
      return res.json(cached);
    }

    // Si pas en cache, récupérer depuis MongoDB
    const questions = await Question.find({});
    const questionsData = questions.map(q => ({
      id: q.id,
      question: q.question,
      choices: q.choices
    }));

    // Mettre en cache
    await cache.set(CACHE_KEYS.ALL_QUESTIONS, questionsData, cache.TTL.QUESTIONS);
    console.log('✅ Questions fetched from DB and cached');

    res.json(questionsData);
  } catch (error) {
    console.error('Error getting questions:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getFullQuestions = async (req, res) => {
  try {
    // Essayer de récupérer depuis le cache
    const cached = await cache.get(CACHE_KEYS.FULL_QUESTIONS);
    if (cached) {
      console.log('✅ Full questions served from cache');
      return res.json(cached);
    }

    // Si pas en cache, récupérer depuis MongoDB
    const questions = await Question.find({});
    const questionsData = questions.map(q => q.toObject());

    // Mettre en cache
    await cache.set(CACHE_KEYS.FULL_QUESTIONS, questionsData, cache.TTL.QUESTIONS);
    console.log('✅ Full questions fetched from DB and cached');

    res.json(questionsData);
  } catch (error) {
    console.error('Error getting full questions:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};