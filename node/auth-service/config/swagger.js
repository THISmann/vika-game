const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'API documentation for the Authentication Service of IntelectGame',
      contact: {
        name: 'API Support',
        email: 'support@intelectgame.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'http://localhost:3000/auth',
        description: 'API Gateway (Development)'
      }
    ],
    tags: [
      {
        name: 'Admin',
        description: 'Admin authentication endpoints'
      },
      {
        name: 'Players',
        description: 'Player management endpoints'
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
            }
          }
        },
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
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;



