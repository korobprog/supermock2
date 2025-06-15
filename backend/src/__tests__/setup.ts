import { PrismaClient } from '@prisma/client';
import { redis } from '../config/redis';

const prisma = new PrismaClient();

// Global setup
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
  
  // Connect to Redis
  await redis.connect();
  
  // Clear test data
  await prisma.pointsTransaction.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
});

// Global teardown
afterAll(async () => {
  // Disconnect from database
  await prisma.$disconnect();
  
  // Disconnect from Redis
  await redis.disconnect();
});

// Reset database between tests
beforeEach(async () => {
  await prisma.pointsTransaction.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
}); 