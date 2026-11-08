import Fastify, { FastifyInstance, FastifyError } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { authRoutes } from './routes/auth.js';
import { formsRoutes } from './routes/forms.js';
import { publicRoutes } from './routes/public.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false, // Clean test output; configurable via env
    bodyLimit: 1048576, // 1MB payload limit to prevent DoS attacks
  });

  // Enable CORS
  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Rate Limiting: 120 requests per minute per IP
  await app.register(rateLimit, {
    max: 120,
    timeWindow: '1 minute',
  });

  // OpenAPI Documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'OpenForm Steps API',
        description: 'Secure, high-performance hosted form service and submission API',
        version: '2.0.0',
      },
      servers: [{ url: 'http://localhost:3001' }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Health check endpoint
  const healthHandler = async () => ({
    status: 'ok',
    version: '2.0.0',
    service: 'openform-steps-api',
    timestamp: new Date().toISOString(),
  });
  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // Mount API route modules
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(formsRoutes, { prefix: '/api/forms' });
  await app.register(publicRoutes, { prefix: '/api/public' });

  // Safe global error handler
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) {
      return reply.status(500).send({
        error: 'InternalServerError',
        message: 'An unexpected internal error occurred. Please try again later.',
      });
    }
    return reply.status(statusCode).send({
      error: error.name || 'Error',
      message: error.message,
    });
  });

  // 404 handler
  app.setNotFoundHandler((_request, reply) => {
    return reply.status(404).send({
      error: 'NotFound',
      message: 'The requested API route was not found.',
    });
  });

  return app;
}
