import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import env from './config/env';
import { testConnection as testDatabase } from './config/database';
import { testConnection as testRedis } from './config/redis';
import userRoutes from './routes/user.routes';
import interviewRoutes from './routes/interview.routes';
import notificationRoutes from './routes/notification.routes';
import bookingRoutes from './routes/booking.routes';
import pointsRoutes from './routes/points.routes';
import { errorHandler } from './utils/errors';
import { rateLimiter } from './middleware/rateLimiter';

// Создаем папки для загрузки файлов при старте сервера
const uploadsDir = path.join(process.cwd(), 'uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');

if (!fs.existsSync(uploadsDir)) {
  console.log('📁 Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(avatarsDir)) {
  console.log('📁 Creating avatars directory...');
  fs.mkdirSync(avatarsDir, { recursive: true });
}

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

// Статическая раздача загруженных файлов
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Apply rate limiter to all routes
app.use(rateLimiter);

// Middleware для логирования всех запросов
app.use((req, res, next) => {
  console.log(`🔍 [REQUEST DEBUG] ${req.method} ${req.url}`);
  console.log(`🔍 [REQUEST DEBUG] Headers:`, req.headers);
  console.log(`🔍 [REQUEST DEBUG] Content-Type:`, req.headers['content-type']);
  console.log(
    `🔍 [REQUEST DEBUG] Authorization:`,
    req.headers.authorization ? 'Present' : 'Missing'
  );
  next();
});

// Middleware для отслеживания обработки маршрутов
app.use((req, res, next) => {
  console.log(`🔍 [ROUTE DEBUG] Processing route: ${req.method} ${req.url}`);
  next();
});

// API Routes with prefix
console.log('🔍 [ROUTES DEBUG] API_PREFIX:', env.API_PREFIX);
console.log(
  '🔍 [ROUTES DEBUG] Registering user routes at:',
  `${env.API_PREFIX}/users`
);
console.log(
  '🔍 [ROUTES DEBUG] Full avatar endpoint will be:',
  `${env.API_PREFIX}/users/avatar`
);

// Middleware для отладки маршрутов перед их регистрацией
app.use((req, res, next) => {
  console.log(
    `🔍 [ROUTE MATCH DEBUG] Checking route: ${req.method} ${req.originalUrl}`
  );
  next();
});

// Добавляем логирование для каждого подключаемого роутера
app.use(
  `${env.API_PREFIX}/users`,
  (req, res, next) => {
    console.log(
      `🔍 [USER ROUTES DEBUG] User routes middleware hit: ${req.method} ${req.originalUrl}`
    );
    console.log(`🔍 [USER ROUTES DEBUG] Path after prefix: ${req.path}`);
    console.log(`🔍 [USER ROUTES DEBUG] URL: ${req.url}`);
    next();
  },
  userRoutes
);

app.use(`${env.API_PREFIX}/interviews`, interviewRoutes);
app.use(`${env.API_PREFIX}/notifications`, notificationRoutes);
app.use(`${env.API_PREFIX}/points`, pointsRoutes);
app.use(`${env.API_PREFIX}`, bookingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Middleware для отлова всех необработанных маршрутов
app.use('*', (req, res, next) => {
  console.log(
    `❌ [404 DEBUG] Unhandled route: ${req.method} ${req.originalUrl}`
  );
  console.log(`❌ [404 DEBUG] Base URL: ${req.baseUrl}`);
  console.log(`❌ [404 DEBUG] Path: ${req.path}`);
  console.log(`❌ [404 DEBUG] URL: ${req.url}`);
  console.log(`❌ [404 DEBUG] Headers:`, req.headers);

  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    debug: {
      method: req.method,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      path: req.path,
      url: req.url,
    },
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
