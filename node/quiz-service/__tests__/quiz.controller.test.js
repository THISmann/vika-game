// Tests pour quiz.controller.js
const quizController = require('../controllers/quiz.controller');
const fs = require('fs');
const path = require('path');

describe('Quiz Controller', () => {
  const testQuestionsPath = path.join(__dirname, '../data/questions.test.json');
  const originalPath = path.join(__dirname, '../data/questions.json');

  beforeEach(() => {
    // Créer un fichier de test
    fs.writeFileSync(testQuestionsPath, JSON.stringify([]));
    // Sauvegarder le chemin original et utiliser le chemin de test
    jest.spyOn(path, 'join').mockImplementation((...args) => {
      if (args.includes('questions.json')) {
        return testQuestionsPath;
      }
      return path.join(...args);
    });
  });

  afterEach(() => {
    // Nettoyer le fichier de test
    if (fs.existsSync(testQuestionsPath)) {
      fs.unlinkSync(testQuestionsPath);
    }
    jest.restoreAllMocks();
  });

  test('should add a question', () => {
    const req = {
      body: {
        question: 'Test question?',
        choices: ['A', 'B', 'C', 'D'],
        answer: 'A'
      }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    quizController.addQuestion(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
    const addedQuestion = res.json.mock.calls[0][0];
    expect(addedQuestion.question).toBe('Test question?');
    expect(addedQuestion.choices).toEqual(['A', 'B', 'C', 'D']);
  });

  test('should reject question with missing fields', () => {
    const req = {
      body: {
        question: 'Test question?'
        // Missing choices and answer
      }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    quizController.addQuestion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing fields' });
  });

  test('should get questions without answers', () => {
    // Ajouter une question d'abord
    const addReq = {
      body: {
        question: 'Test question?',
        choices: ['A', 'B', 'C', 'D'],
        answer: 'A'
      }
    };
    const addRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    quizController.addQuestion(addReq, addRes);

    // Récupérer les questions
    const getReq = {};
    const getRes = {
      json: jest.fn()
    };

    quizController.getQuestions(getReq, getRes);

    expect(getRes.json).toHaveBeenCalled();
    const questions = getRes.json.mock.calls[0][0];
    expect(questions[0]).not.toHaveProperty('answer');
    expect(questions[0]).toHaveProperty('id');
    expect(questions[0]).toHaveProperty('question');
    expect(questions[0]).toHaveProperty('choices');
  });

  test('should get full questions with answers', () => {
    // Ajouter une question d'abord
    const addReq = {
      body: {
        question: 'Test question?',
        choices: ['A', 'B', 'C', 'D'],
        answer: 'A'
      }
    };
    const addRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    quizController.addQuestion(addReq, addRes);

    // Récupérer les questions complètes
    const getReq = {};
    const getRes = {
      json: jest.fn()
    };

    quizController.getFullQuestions(getReq, getRes);

    expect(getRes.json).toHaveBeenCalled();
    const questions = getRes.json.mock.calls[0][0];
    expect(questions[0]).toHaveProperty('answer');
  });

  test('should delete a question', () => {
    // Ajouter une question d'abord
    const addReq = {
      body: {
        question: 'Test question?',
        choices: ['A', 'B', 'C', 'D'],
        answer: 'A'
      }
    };
    const addRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    quizController.addQuestion(addReq, addRes);
    const questionId = addRes.json.mock.calls[0][0].id;

    // Supprimer la question
    const deleteReq = {
      params: { id: questionId }
    };
    const deleteRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    quizController.deleteQuestion(deleteReq, deleteRes);

    expect(deleteRes.json).toHaveBeenCalledWith({ message: 'Deleted' });
  });
});







