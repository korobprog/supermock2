import express from 'express';
import cors from 'cors';
import env from './config/env';
import { testConnection as testDatabase } from './config/database';
import { testConnection as testRedis } from './config/redis';
import userRoutes from './routes/user.routes';
import interviewRoutes from './routes/interview.routes';
import notificationRoutes from './routes/notification.routes';
import { errorHandler } from './utils/errors';
import { rateLimiter } from './middleware/rateLimiter';

// Create Express application
const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Получаем разрешенные origins из переменной окружения или используем значения по умолчанию
      const corsOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
      const defaultOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:5177',
        'http://localhost:5178',
        'http://localhost:5179',
        'http://localhost:5180',
      ];

      const allowedOrigins =
        corsOrigins.length > 1 ? corsOrigins : defaultOrigins;

      // Разрешить запросы без origin (например, мобильные приложения)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to all routes
app.use(rateLimiter);

// API Routes with prefix
app.use(`${env.API_PREFIX}/users`, userRoutes);
app.use(`${env.API_PREFIX}/interviews`, interviewRoutes);
app.use(`${env.API_PREFIX}/notifications`, notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Test database connection
    await testDatabase();

    // Test Redis connection
    await testRedis();

    // Start Express server
    app.listen(env.PORT, () => {
      console.log(
        `🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`
      );
      console.log(`📝 API Documentation available at ${env.API_PREFIX}/docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
