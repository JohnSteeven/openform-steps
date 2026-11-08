import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { usersTable } from '../db/schema.js';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../lib/auth.js';
import { eq } from 'drizzle-orm';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Register new account
  fastify.post('/register', async (request, reply) => {
    const parse = registerSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: parse.error.errors[0]?.message || 'Invalid input data',
      });
    }

    const { email, password, name } = parse.data;

    // Check existing email
    const existing = db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).get();
    if (existing) {
      return reply.status(409).send({
        error: 'ConflictError',
        message: 'An account with this email address already exists.',
      });
    }

    const userId = `usr_${crypto.randomUUID().replace(/-/g, '')}`;
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    db.insert(usersTable)
      .values({
        id: userId,
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: 'user',
        createdAt: now,
        updatedAt: now,
      })
      .run();

    const token = signToken({ userId, email: email.toLowerCase(), role: 'user' });

    return reply.status(201).send({
      token,
      user: {
        id: userId,
        email: email.toLowerCase(),
        name,
        role: 'user',
      },
    });
  });

  // Log in
  fastify.post('/login', async (request, reply) => {
    const parse = loginSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: 'Email and password are required.',
      });
    }

    const { email, password } = parse.data;
    const user = db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).get();

    if (!user) {
      return reply.status(401).send({
        error: 'UnauthorizedError',
        message: 'Invalid email or password.',
      });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return reply.status(401).send({
        error: 'UnauthorizedError',
        message: 'Invalid email or password.',
      });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    return reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  });

  // Get current user profile
  fastify.get('/me', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }

    const user = db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).get();
    if (!user) {
      return reply.status(404).send({ error: 'NotFound', message: 'User not found' });
    }

    return reply.send({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    });
  });

  // Log out
  fastify.post('/logout', async (_request, reply) => {
    return reply.send({ message: 'Logged out successfully' });
  });
};
