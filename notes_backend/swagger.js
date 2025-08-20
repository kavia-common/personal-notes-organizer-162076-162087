const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Express API',
      version: '1.0.0',
      description: 'A simple Express API documented with Swagger',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        Note: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            title: { type: 'string' },
            content: { type: 'string' },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
            isArchived: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        NoteCreateInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            isArchived: { type: 'boolean' },
          },
        },
        NoteUpdateInput: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            isArchived: { type: 'boolean' },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Service health' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Notes', description: 'Notes CRUD and search' },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
