const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IntelectGame API Gateway',
      version: '1.0.0',
      description: 'API Gateway documentation for all IntelectGame services (Auth, Quiz, Game, Telegram)',
      contact: {
        name: 'API Support',
        email: 'support@intelectgame.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server (API Gateway)'
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and player management endpoints'
      },
      {
        name: 'Quiz',
        description: 'Question management endpoints'
      },
      {
        name: 'Game',
        description: 'Game management, answers, scores, and state endpoints'
      },
      {
        name: 'Telegram',
        description: 'Telegram bot endpoints'
      },
      {
        name: 'Gateway',
        description: 'API Gateway endpoints'
      }
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            message: {
              type: 'string',
              description: 'Additional error details'
            }
          }
        },
        // Auth Service Schemas
        Player: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique player identifier',
              example: 'p1234567890'
            },
            name: {
              type: 'string',
              description: 'Player name',
              example: 'Alice'
            },
            score: {
              type: 'number',
              description: 'Player score',
              example: 0
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              example: 'admin'
            },
            password: {
              type: 'string',
              example: 'admin'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT token for authentication',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        },
        RegisterPlayerRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              description: 'Player name (must be unique)',
              minLength: 2,
              maxLength: 20,
              example: 'Alice'
            }
          }
        },
        // Quiz Service Schemas
        Question: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'q1234567890'
            },
            question: {
              type: 'string',
              example: 'What is the capital of France?'
            },
            choices: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Paris', 'London', 'Berlin', 'Madrid']
            },
            answer: {
              type: 'string',
              description: 'Correct answer (only in full questions)',
              example: 'Paris'
            }
          }
        },
        QuestionPublic: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'q1234567890'
            },
            question: {
              type: 'string',
              example: 'What is the capital of France?'
            },
            choices: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Paris', 'London', 'Berlin', 'Madrid']
            }
          }
        },
        CreateQuestionRequest: {
          type: 'object',
          required: ['question', 'choices', 'answer'],
          properties: {
            question: {
              type: 'string',
              example: 'What is the capital of France?'
            },
            choices: {
              type: 'array',
              items: {
                type: 'string'
              },
              minItems: 2,
              example: ['Paris', 'London', 'Berlin', 'Madrid']
            },
            answer: {
              type: 'string',
              example: 'Paris'
            }
          }
        },
        UpdateQuestionRequest: {
          type: 'object',
          properties: {
            question: {
              type: 'string',
              example: 'What is the capital of France?'
            },
            choices: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Paris', 'London', 'Berlin', 'Madrid']
            },
            answer: {
              type: 'string',
              example: 'Paris'
            }
          }
        },
        // Game Service Schemas
        AnswerRequest: {
          type: 'object',
          required: ['playerId', 'questionId', 'answer'],
          properties: {
            playerId: {
              type: 'string',
              example: 'p1234567890'
            },
            questionId: {
              type: 'string',
              example: 'q1234567890'
            },
            answer: {
              type: 'string',
              example: 'Paris'
            }
          }
        },
        AnswerResponse: {
          type: 'object',
          properties: {
            correct: {
              type: 'boolean'
            },
            correctAnswer: {
              type: 'string'
            },
            playerName: {
              type: 'string'
            },
            answered: {
              type: 'boolean'
            },
            message: {
              type: 'string'
            }
          }
        },
        Score: {
          type: 'object',
          properties: {
            playerId: {
              type: 'string',
              example: 'p1234567890'
            },
            playerName: {
              type: 'string',
              example: 'Alice'
            },
            score: {
              type: 'number',
              example: 5
            }
          }
        },
        LeaderboardEntry: {
          type: 'object',
          properties: {
            playerId: {
              type: 'string',
              example: 'p1234567890'
            },
            playerName: {
              type: 'string',
              example: 'Alice'
            },
            score: {
              type: 'number',
              example: 5
            }
          }
        },
        GameState: {
          type: 'object',
          properties: {
            isStarted: {
              type: 'boolean'
            },
            currentQuestionIndex: {
              type: 'number',
              example: 0
            },
            currentQuestionId: {
              type: 'string',
              example: 'q1234567890'
            },
            questionStartTime: {
              type: 'number',
              example: 1234567890000
            },
            questionDuration: {
              type: 'number',
              example: 30000
            },
            connectedPlayersCount: {
              type: 'number',
              example: 5
            },
            gameSessionId: {
              type: 'string'
            },
            gameCode: {
              type: 'string',
              example: 'ABC123'
            }
          }
        },
        GameCodeResponse: {
          type: 'object',
          properties: {
            gameCode: {
              type: 'string',
              example: 'ABC123'
            }
          }
        },
        VerifyCodeRequest: {
          type: 'object',
          required: ['code'],
          properties: {
            code: {
              type: 'string',
              example: 'ABC123'
            },
            gameCode: {
              type: 'string',
              example: 'ABC123'
            }
          }
        },
        VerifyCodeResponse: {
          type: 'object',
          properties: {
            valid: {
              type: 'boolean'
            },
            gameCode: {
              type: 'string'
            },
            isStarted: {
              type: 'boolean'
            },
            message: {
              type: 'string'
            }
          }
        },
        ConnectedPlayersCount: {
          type: 'object',
          properties: {
            count: {
              type: 'number',
              example: 5
            }
          }
        },
        ConnectedPlayer: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'p1234567890'
            },
            name: {
              type: 'string',
              example: 'Alice'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', '../server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

