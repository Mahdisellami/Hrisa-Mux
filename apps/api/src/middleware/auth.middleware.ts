import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from './error.middleware';
import { logger } from '../utils/logger';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    // First try Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    // Fallback to cookie (for HTML5 audio/video streaming)
    else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError(401, 'No authentication token provided');
    }

    try {
      const payload = verifyAccessToken(token);
      req.user = payload;
      next();
    } catch (error) {
      throw new AppError(401, 'Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const payload = verifyAccessToken(token);
        req.user = payload;
      } catch (error) {
        logger.warn('Invalid token provided in optional auth');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}
