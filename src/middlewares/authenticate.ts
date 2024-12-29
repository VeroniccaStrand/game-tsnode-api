import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { AuthService } from '../services/authService.js';

import logger from '../utils/logger.js';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        /**
         * STEP 1: Extract the Authorization header
         * -----------------------------------------
         * - Check if the header is present.
         * - Ensure it starts with 'Bearer '.
         * - If not, reject the request with a 401 error.
         */
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.info('Authorization header is missing or invalid');
            throw new AppError('Authentication token is missing or invalid', 401);
        }

        // Extract the token from the header
        const token = authHeader.split(' ')[1];

        try {
            /**
             * STEP 2: Verify the token
             * ------------------------
             * - Validate the token's signature and expiration.
             * - Decode the token to extract the user's ID.
             * - Attach the user ID to the request object for further use.
             */

            const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string; exp: number };

            req.user = { id: decoded.id }; // Attach user info to the request
            return next(); // Continue to the next middleware
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                /**
                 * STEP 3: Handle expired tokens
                 * -----------------------------
                 * - Decode the token without verifying its signature.
                 * - Extract the user ID from the decoded payload.
                 * - Attempt to generate a new access token using the refresh token.
                 */

                const decoded = jwt.decode(token) as { id: string } | null;

                if (!decoded || !decoded.id) {
                    throw new AppError('Invalid token payload', 401);
                }

                const userId = decoded.id;

                try {
                    // Generate a new access token using the refresh token
                    const newAccessToken = await AuthService.handleExpiredAccessToken(token);

                    // Attach the new access token to the response header
                    res.setHeader('Authorization', `Bearer ${newAccessToken}`);

                    // Attach the user ID to the request object again
                    req.user = { id: userId };
                    return next();
                } catch (refreshError: any) {
                    // If refresh token handling fails, reject the request
                    throw new AppError(refreshError.message, 401);
                }
            }

            /**
             * STEP 4: Handle invalid tokens
             * -----------------------------
             * - If the token is invalid for reasons other than expiration,
             *   reject the request with a generic error.
             */

            throw new AppError('Invalid or expired token', 401);
        }
    } catch (error: any) {
        /**
         * STEP 5: Handle unexpected errors
         * ---------------------------------
         * - Pass any unhandled errors to the global error handler.
         */

        next(error);
    }
};
