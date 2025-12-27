const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quiz Service API',
      version: '1.0.0',
      description: 'API documentation for the Quiz Service of IntelectGame',
      contact: {
        name: 'API Support',
        email: 'support@intelectgame.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server'
      },
      {
        url: 'http://localhost:3000/quiz',
        description: 'API Gateway (Development)'
      }
    ],
    tags: [
      {
        name: 'Questions',
        description: 'Question management endpoints'
      },
      {
        name: 'Admin',
        description: 'Admin-only endpoints for question management'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        Question: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique question identifier',
              example: 'q1234567890'
            },
            question: {
              type: 'string',
              description: 'Question text',
              example: 'What is the capital of France?'
            },
            choices: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Answer choices',
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
              description: 'Question text',
              example: 'What is the capital of France?'
            },
            choices: {
              type: 'array',
              items: {
                type: 'string'
              },
              minItems: 2,
              description: 'Answer choices (minimum 2)',
              example: ['Paris', 'London', 'Berlin', 'Madrid']
            },
            answer: {
              type: 'string',
              description: 'Correct answer (must be one of the choices)',
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
        DeleteResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Deleted'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;



