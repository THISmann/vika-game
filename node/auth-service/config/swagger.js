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
      },
      {
        name: 'Users',
        description: 'User registration and authentication endpoints'
      },
      {
        name: 'User Management',
        description: 'Admin endpoints for managing users'
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
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique user identifier',
              example: 'u1234567890'
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com'
            },
            role: {
              type: 'string',
              enum: ['player', 'user', 'admin'],
              description: 'User role',
              example: 'user'
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected', 'blocked'],
              description: 'User status',
              example: 'pending'
            },
            contact: {
              type: 'string',
              description: 'User contact information',
              example: '+1234567890'
            },
            useCase: {
              type: 'string',
              description: 'Use case for the platform',
              example: 'education'
            },
            country: {
              type: 'string',
              description: 'User country',
              example: 'France'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date'
            },
            lastLoginAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last login date'
            }
          }
        },
        RegisterUserRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password (minimum 6 characters)',
              example: 'password123'
            },
            contact: {
              type: 'string',
              description: 'User contact information',
              example: '+1234567890'
            },
            useCase: {
              type: 'string',
              enum: ['education', 'corporate', 'entertainment', 'events', 'other'],
              description: 'Use case for the platform',
              example: 'education'
            },
            country: {
              type: 'string',
              description: 'User country',
              example: 'France'
            }
          }
        },
        UserLoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            password: {
              type: 'string',
              example: 'password123'
            }
          }
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            }
          }
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['token', 'password'],
          properties: {
            token: {
              type: 'string',
              description: 'Password reset token',
              example: 'reset-token-123'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'New password (minimum 6 characters)',
              example: 'newpassword123'
            }
          }
        },
        UserStats: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              description: 'Total number of users',
              example: 100
            },
            pending: {
              type: 'number',
              description: 'Number of pending users',
              example: 10
            },
            approved: {
              type: 'number',
              description: 'Number of approved users',
              example: 80
            },
            rejected: {
              type: 'number',
              description: 'Number of rejected users',
              example: 5
            },
            blocked: {
              type: 'number',
              description: 'Number of blocked users',
              example: 5
            },
            recentRegistrations: {
              type: 'number',
              description: 'Number of registrations in the last 7 days',
              example: 15
            },
            game: {
              type: 'object',
              properties: {
                connectedPlayers: {
                  type: 'number',
                  example: 5
                },
                isGameStarted: {
                  type: 'boolean',
                  example: false
                }
              }
            }
          }
        },
        AnalyticsResponse: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                totalUsers: { type: 'number' },
                newUsers: { type: 'number' },
                totalVisits: { type: 'number' },
                activeUsers: { type: 'number' }
              }
            },
            charts: {
              type: 'object',
              properties: {
                labels: {
                  type: 'array',
                  items: { type: 'string' }
                },
                userGrowth: {
                  type: 'array',
                  items: { type: 'number' }
                },
                visits: {
                  type: 'array',
                  items: { type: 'number' }
                },
                registrations: {
                  type: 'array',
                  items: { type: 'number' }
                },
                activeUsers: {
                  type: 'array',
                  items: { type: 'number' }
                }
              }
            }
          }
        },
        UserActivity: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['registration', 'login', 'status_change'],
              example: 'login'
            },
            description: {
              type: 'string',
              example: 'User logged in'
            },
            date: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00Z'
            }
          }
        },
        UsersListResponse: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total: { type: 'number', example: 100 },
                pages: { type: 'number', example: 5 }
              }
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
  apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;



