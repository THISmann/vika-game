const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Game Service API',
      version: '1.0.0',
      description: 'API documentation for the Game Service of IntelectGame',
      contact: {
        name: 'API Support',
        email: 'support@intelectgame.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3003',
        description: 'Development server'
      },
      {
        url: 'http://localhost:3000/game',
        description: 'API Gateway (Development)'
      }
    ],
    tags: [
      {
        name: 'Game',
        description: 'Game management endpoints'
      },
      {
        name: 'Answers',
        description: 'Answer submission endpoints'
      },
      {
        name: 'Scores',
        description: 'Score and leaderboard endpoints'
      },
      {
        name: 'State',
        description: 'Game state endpoints'
      },
      {
        name: 'Players',
        description: 'Connected players endpoints'
      },
      {
        name: 'WebSocket',
        description: 'WebSocket events for real-time game updates'
      },
      {
        name: 'Parties',
        description: 'Game party/session management endpoints'
      },
      {
        name: 'Upload',
        description: 'File upload endpoints (images and audio)'
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
            details: {
              type: 'string',
              description: 'Additional error details (development only)'
            }
          }
        },
        AnswerRequest: {
          type: 'object',
          required: ['playerId', 'questionId', 'answer'],
          properties: {
            playerId: {
              type: 'string',
              description: 'Player identifier',
              example: 'p1234567890'
            },
            questionId: {
              type: 'string',
              description: 'Question identifier',
              example: 'q1234567890'
            },
            answer: {
              type: 'string',
              description: 'Player answer',
              example: 'Paris'
            }
          }
        },
        AnswerResponse: {
          type: 'object',
          properties: {
            correct: {
              type: 'boolean',
              description: 'Whether the answer is correct'
            },
            correctAnswer: {
              type: 'string',
              description: 'The correct answer'
            },
            playerName: {
              type: 'string',
              description: 'Player name'
            },
            answered: {
              type: 'boolean',
              description: 'Whether the answer was recorded'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            alreadyAnswered: {
              type: 'boolean',
              description: 'Whether the player already answered this question'
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
              type: 'boolean',
              description: 'Whether the game has started'
            },
            currentQuestionIndex: {
              type: 'number',
              description: 'Current question index (0-based)',
              example: 0
            },
            currentQuestionId: {
              type: 'string',
              description: 'Current question ID',
              example: 'q1234567890'
            },
            questionStartTime: {
              type: 'number',
              description: 'Timestamp when current question started',
              example: 1234567890000
            },
            questionDuration: {
              type: 'number',
              description: 'Question duration in milliseconds',
              example: 30000
            },
            connectedPlayersCount: {
              type: 'number',
              description: 'Number of connected players',
              example: 5
            },
            gameSessionId: {
              type: 'string',
              description: 'Game session identifier'
            },
            gameCode: {
              type: 'string',
              description: 'Game access code',
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
              description: 'Game code to verify',
              example: 'ABC123'
            },
            gameCode: {
              type: 'string',
              description: 'Alternative field name for game code',
              example: 'ABC123'
            }
          }
        },
        VerifyCodeResponse: {
          type: 'object',
          properties: {
            valid: {
              type: 'boolean',
              description: 'Whether the code is valid'
            },
            gameCode: {
              type: 'string',
              description: 'Current game code'
            },
            isStarted: {
              type: 'boolean',
              description: 'Whether the game has started'
            },
            message: {
              type: 'string',
              description: 'Verification message'
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
        },
        StartGameResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            message: {
              type: 'string'
            },
            gameState: {
              $ref: '#/components/schemas/GameState'
            }
          }
        },
        NextQuestionResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            message: {
              type: 'string'
            },
            question: {
              $ref: '#/components/schemas/Question'
            },
            questionIndex: {
              type: 'number'
            }
          }
        },
        EndGameResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            message: {
              type: 'string'
            }
          }
        },
        DeleteGameResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            message: {
              type: 'string'
            }
          }
        },
        QuestionResults: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              questionId: {
                type: 'string'
              },
              correctAnswer: {
                type: 'string'
              },
              playerResults: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    playerId: {
                      type: 'string'
                    },
                    answer: {
                      type: 'string'
                    },
                    isCorrect: {
                      type: 'boolean'
                    }
                  }
                }
              }
            }
          }
        },
        Question: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            question: {
              type: 'string'
            },
            choices: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        },
        WebSocketEvent: {
          type: 'object',
          description: 'WebSocket event structure',
          properties: {
            event: {
              type: 'string',
              description: 'Event name',
              example: 'game:started'
            },
            data: {
              type: 'object',
              description: 'Event data'
            }
          }
        },
        WebSocketRegisterRequest: {
          type: 'object',
          description: 'WebSocket register event payload',
          required: ['playerId'],
          properties: {
            playerId: {
              type: 'string',
              description: 'Player ID to register',
              example: 'p1234567890'
            }
          }
        },
        WebSocketScoreUpdate: {
          type: 'object',
          description: 'WebSocket score:update event payload',
          properties: {
            playerId: {
              type: 'string',
              example: 'p1234567890'
            },
            score: {
              type: 'number',
              example: 5
            }
          }
        },
        WebSocketLeaderboardUpdate: {
          type: 'array',
          description: 'WebSocket leaderboard:update event payload',
          items: {
            $ref: '#/components/schemas/LeaderboardEntry'
          }
        },
        GameSession: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Game session ID',
              example: 'session123'
            },
            name: {
              type: 'string',
              description: 'Party name',
              example: 'Christmas Quiz 2024'
            },
            description: {
              type: 'string',
              description: 'Party description',
              example: 'A fun quiz for the holidays'
            },
            gameCode: {
              type: 'string',
              description: 'Game access code',
              example: 'ABC123'
            },
            questionIds: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of question IDs for this party'
            },
            questionDuration: {
              type: 'number',
              description: 'Duration per question in milliseconds',
              example: 30000
            },
            scheduledStartTime: {
              type: 'string',
              format: 'date-time',
              description: 'Scheduled start time (optional)',
              nullable: true
            },
            imageUrl: {
              type: 'string',
              description: 'URL of uploaded image (optional)',
              nullable: true
            },
            audioUrl: {
              type: 'string',
              description: 'URL of uploaded audio file (optional)',
              nullable: true
            },
            status: {
              type: 'string',
              enum: ['draft', 'scheduled', 'active', 'completed', 'cancelled'],
              description: 'Party status',
              example: 'draft'
            },
            createdBy: {
              type: 'string',
              description: 'User ID who created the party',
              example: 'u1234567890'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        CreatePartyRequest: {
          type: 'object',
          required: ['name', 'questionIds'],
          properties: {
            name: {
              type: 'string',
              description: 'Party name',
              example: 'Christmas Quiz 2024'
            },
            description: {
              type: 'string',
              description: 'Party description',
              example: 'A fun quiz for the holidays'
            },
            questionIds: {
              type: 'array',
              items: {
                type: 'string'
              },
              minItems: 1,
              description: 'List of question IDs'
            },
            questionDuration: {
              type: 'number',
              description: 'Duration per question in milliseconds',
              default: 30000,
              example: 30000
            },
            scheduledStartTime: {
              type: 'string',
              format: 'date-time',
              description: 'Scheduled start time (optional)',
              nullable: true
            },
            imageUrl: {
              type: 'string',
              description: 'URL of uploaded image (optional)',
              nullable: true
            },
            audioUrl: {
              type: 'string',
              description: 'URL of uploaded audio file (optional)',
              nullable: true
            }
          }
        },
        UpdatePartyRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Christmas Quiz 2024'
            },
            description: {
              type: 'string',
              example: 'A fun quiz for the holidays'
            },
            questionIds: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            questionDuration: {
              type: 'number',
              example: 30000
            },
            scheduledStartTime: {
              type: 'string',
              format: 'date-time',
              nullable: true
            },
            imageUrl: {
              type: 'string',
              nullable: true
            },
            audioUrl: {
              type: 'string',
              nullable: true
            }
          }
        },
        VerifyCodeResponseWithParty: {
          type: 'object',
          properties: {
            valid: {
              type: 'boolean',
              description: 'Whether the code is valid'
            },
            gameCode: {
              type: 'string',
              description: 'Current game code'
            },
            isStarted: {
              type: 'boolean',
              description: 'Whether the game has started'
            },
            message: {
              type: 'string',
              description: 'Verification message'
            },
            partyInfo: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'Christmas Quiz 2024'
                },
                description: {
                  type: 'string',
                  example: 'A fun quiz for the holidays'
                },
                imageUrl: {
                  type: 'string',
                  nullable: true
                },
                audioUrl: {
                  type: 'string',
                  nullable: true
                },
                scheduledStartTime: {
                  type: 'string',
                  format: 'date-time',
                  nullable: true
                }
              }
            }
          }
        },
        UploadResponse: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL of the uploaded file',
              example: '/api/files/image-1234567890.jpg'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;


