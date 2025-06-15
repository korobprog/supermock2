import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';
import env from '../config/env';

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  const maxRequests = env.RATE_LIMIT_MAX_REQUESTS;

  // Get client IP
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const key = `ratelimit:${ip}`;

  try {
    // Get current request count
    const current = await redis.get(key);
    const count = current ? parseInt(current) : 0;

    if (count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Please try again after ${windowMs / 1000} seconds`,
        retryAfter: windowMs / 1000,
      });
    }

    // Increment request count
    await redis.incr(key);
    
    // Set expiry if this is the first request
    if (count === 0) {
      await redis.expire(key, windowMs / 1000);
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count - 1));
    res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000 + windowMs / 1000));

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    // If Redis fails, allow the request to proceed
    next();
  }
}; 