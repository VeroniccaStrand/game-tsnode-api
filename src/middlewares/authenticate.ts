import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { AuthService } from '../services/authService.js';

import logger from '../utils/logger.js';
import { UserModel } from '../models/User.js';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.info('Authorization header is missing or invalid');
            throw new AppError('Authentication token is missing or invalid', 401);
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string; exp: number };

            const user = await UserModel.findById(decoded.id);
            if (!user || user.refreshTokens.length === 0) {
                throw new AppError('Session has expired. Please log in again.', 401);
            }

            req.user = { id: decoded.id };

            return next();
        } catch (error: any) {
            logger.error(`JWT verification failed: ${error.name} - ${error.message}`);
            if (error.name === 'TokenExpiredError') {
                const decoded = jwt.decode(token) as { id: string } | null;

                if (!decoded || !decoded.id) {
                    throw new AppError('Invalid token payload', 401);
                }

                const userId = decoded.id;

                try {
                    const newAccessToken = await AuthService.handleExpiredAccessToken(token);

                    res.setHeader('Authorization', `Bearer ${newAccessToken}`);

                    req.user = { id: userId };
                    return next();
                } catch (refreshError: any) {
                    throw new AppError(refreshError.message, 401);
                }
            }

            throw new AppError('Invalid or expired token', 401);
        }
    } catch (error: any) {
        next(error);
    }
};
