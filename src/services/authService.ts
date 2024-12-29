import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config/config.env.js'; // Importera din hemliga nyckel
import { UserModel } from '../models/User.js';
import { loggers } from 'winston';
import logger from '../utils/logger.js';

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
            } catch (error) {
                return false;
            }
        });

        if (!validRefreshToken) {
            throw new Error('No valid token found, Please login again');
        }
        const newAcessToken = this.generateAccessToken({ id: userId });
        return newAcessToken;
        logger.info(`new accesstoken: ${newAcessToken}`);
    }
}

// *TODO - refresh accesstoken
// *TODO - Logout and clear accesstoken
