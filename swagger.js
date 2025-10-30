const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Perfume World API',
      version: '1.0.0',
      description: 'API documentation for Perfume World - E-commerce platform for perfumes',
      contact: {
        name: 'API Support',
        email: 'support@perfumeworld.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://perfume-world-api.onrender.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in httpOnly cookie',
        },
      },
      schemas: {
        Brand: {
          type: 'object',
          required: ['brandName'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated MongoDB ID',
              example: '507f1f77bcf86cd799439011',
            },
            brandName: {
              type: 'string',
              description: 'Brand name',
              example: 'Dior',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Perfume: {
          type: 'object',
          required: ['perfumeName', 'uri', 'price', 'concentration', 'description', 'ingredients', 'volume', 'targetAudience', 'brand'],
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            perfumeName: {
              type: 'string',
              example: 'Sauvage',
            },
            uri: {
              type: 'string',
              description: 'Image URL',
              example: 'https://example.com/image.jpg',
            },
            price: {
              type: 'number',
              example: 120,
            },
            concentration: {
              type: 'string',
              enum: ['Extrait', 'EDP', 'EDT', 'EDC'],
              example: 'EDP',
            },
            description: {
              type: 'string',
              example: 'A fresh and spicy fragrance',
            },
            ingredients: {
              type: 'string',
              example: 'Bergamot, Pepper, Ambroxan',
            },
            volume: {
              type: 'number',
              example: 100,
            },
            targetAudience: {
              type: 'string',
              enum: ['male', 'female', 'unisex'],
              example: 'male',
            },
            brand: {
              type: 'string',
              description: 'Brand ID reference',
              example: '507f1f77bcf86cd799439011',
            },
            comments: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Comment',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 3,
              example: 3,
            },
            content: {
              type: 'string',
              example: 'Great perfume!',
            },
            author: {
              type: 'string',
              description: 'Member ID reference',
              example: '507f1f77bcf86cd799439011',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Member: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            _id: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            YOB: {
              type: 'integer',
              example: 1990,
            },
            gender: {
              type: 'boolean',
              description: 'true = male, false = female',
              example: true,
            },
            isAdmin: {
              type: 'boolean',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            code: {
              type: 'string',
              example: 'ERROR_CODE',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Brands',
        description: 'Brand management (Admin only)',
      },
      {
        name: 'Perfumes',
        description: 'Perfume management (Admin only)',
      },
      {
        name: 'Public',
        description: 'Public endpoints for browsing perfumes',
      },
      {
        name: 'Members',
        description: 'Member management',
      },
    ],
  },
  apis: ['./routes/*.js', './routes/api/*.js'], // Đường dẫn đến file chứa JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Perfume World API Docs',
  }));

  // Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger documentation available at /api-docs');
}

module.exports = setupSwagger;
