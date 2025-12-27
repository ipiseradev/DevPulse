import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevPulse API',
      version: '1.0.0',
      description: 'API para gestión de freelancers: proyectos, clientes, facturas y tareas',
      contact: {
        name: 'DevPulse',
        email: 'support@devpulse.app',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Client: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            company: { type: 'string' },
            address: { type: 'string' },
            notes: { type: 'string' },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            status: { 
              type: 'string', 
              enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'] 
            },
            budget: { type: 'number' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            clientId: { type: 'string', format: 'uuid' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { 
              type: 'string', 
              enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'] 
            },
            priority: { 
              type: 'string', 
              enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] 
            },
            dueDate: { type: 'string', format: 'date-time' },
            projectId: { type: 'string', format: 'uuid' },
          },
        },
        Invoice: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            number: { type: 'string' },
            amount: { type: 'number' },
            status: { 
              type: 'string', 
              enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'] 
            },
            issueDate: { type: 'string', format: 'date-time' },
            dueDate: { type: 'string', format: 'date-time' },
            projectId: { type: 'string', format: 'uuid' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
