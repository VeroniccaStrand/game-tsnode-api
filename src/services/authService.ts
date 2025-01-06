import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config/config.env.js';
import { UserModel } from '../models/User.js';

import logger from '../utils/logger.js';
import { AppError } from '../utils/AppError.js';

//!!! NEED TO DO: handle old access tokens, if new access token is generated, delete/handle old access token
//!!! Maybe add session id to the token payload, so that we can invalidate the token if needed

export class AuthService {
    private static accessSecret = JWT_SECRET || 'default_jwt_secret';
    private static refreshSecret = JWT_REFRESH_SECRET || 'default_refresh_secret';

    static generateAccessToken(payload: object, expiresIn = '15m'): string {
        if (!this.accessSecret) {
            throw new Error('JWT_SECRET is not defined');
        }
        return jwt.sign(payload, this.accessSecret, { expiresIn });
    }

    static async generateRefreshToken(userId: string, expiresIn = '7d') {
        if (!this.refreshSecret) {
            throw new Error('JWT_SECRET is not defined');
        }

        const refreshToken = jwt.sign({ id: userId }, this.refreshSecret, { expiresIn });

        await UserModel.findByIdAndUpdate(userId, { $set: { refreshTokens: [refreshToken] } }, { new: true });
    }

    static decodeToken(token: string): any {
        try {
            return jwt.decode(token);
        } catch (error) {
            throw new Error('Failed to decode token');
        }
    }

    static async handleExpiredAccessToken(token: string): Promise<string> {
        const decoded = this.decodeToken(token);

        if (!decoded || !decoded.id) {
            throw new Error('Invalid token payload');
        }

        const userId = decoded.id;

        const user = await UserModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const validRefreshToken = user.refreshTokens.find((refreshToken: string) => {
            try {
                jwt.verify(refreshToken, this.refreshSecret);
                return true;
                logger.info(`valid refresh token: ${refreshToken}`);
            } catch (error) {
                return false;
            }
        });

        if (!validRefreshToken) {
            throw new Error('No valid token found, Please login again');
        }
        const newAcessToken = this.generateAccessToken({ id: userId });
        logger.info(`new accesstoken: ${newAcessToken}`);
        return newAcessToken;
    }

    static async deleteRefreshToken(userId: string): Promise<void> {
        try {
            const result = await UserModel.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } });

            if (!result) {
                throw new AppError('User not found or refresh token does not exist', 404);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new AppError(`Failed to delete refresh token: ${errorMessage}`, 500);
        }
    }
}
