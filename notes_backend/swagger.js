const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Express API',
      version: '1.0.0',
      description: 'A simple Express API documented with Swagger',
      contact: {
        name: 'Notes API Support',
      },
    },
    externalDocs: {
      description: 'OpenAPI JSON',
      url: '/openapi.json',
    },
    servers: [
      // This value is a static fallback for the generated JSON file.
      // At runtime, both /openapi.json and /docs dynamically compute the server URL
      // from the incoming request host/protocol/port, so the UI points to the right origin.
      { url: 'http://localhost:3000' },
    ],
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
        // PUBLIC_INTERFACE
        Note: {
          /** A persisted note for a user. */
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Note ID' },
            userId: { type: 'integer', description: 'Owner user ID' },
            title: { type: 'string', description: 'Note title' },
            content: { type: 'string', description: 'Note content (markdown/plain)' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of tags',
            },
            isArchived: { type: 'boolean', description: 'Archive flag' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
          },
        },
        // PUBLIC_INTERFACE
        NoteCreateInput: {
          /** Payload to create a new note. */
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', description: 'Note title' },
            content: { type: 'string', description: 'Note content' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Tags for the note' },
            isArchived: { type: 'boolean', description: 'Whether to mark the note archived' },
          },
        },
        // PUBLIC_INTERFACE
        NoteUpdateInput: {
          /** Payload to update an existing note (partial update). */
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
  // Ensure all routes files are scanned
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
