import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { AuthService } from '../services/authService.js';
import { comparePassword, hashPassword } from '../services/bcryptService.js';
import { ResponseUserProfileDto } from '../DTO/userDTO/userProfileDTO.js';

export class UserController {
    static async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                throw new AppError('All fields are required', 400);
            }

            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                throw new AppError('User already exists', 400);
            }
            const hashedPassword = await hashPassword(password);

            const newUser = await UserModel.create({ name, email, password: hashedPassword });
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email
                }
            });
        } catch (error) {
            next(error);
        }
    }
    static async loginUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new AppError('Email and password are required', 400);
            }

            const user = await UserModel.findOne({ email });
            if (!user) {
                throw new AppError('User not found', 404);
            }

            if (!user.password) {
                throw new AppError('User does not have a password set', 400);
            }

            const isPasswordValid = await comparePassword(password, user.password);
            if (!isPasswordValid) {
                throw new AppError('Invalid credentials', 401);
            }

            const token = AuthService.generateAccessToken({ id: user._id });
            const refreshToken = AuthService.generateRefreshToken(user._id);

            res.status(200).json({
                success: true,
                token
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            const user = await UserModel.findById(userId).select('-password');

            if (!user) {
                throw new AppError('User not found', 404);
            }

            const responseDto = new ResponseUserProfileDto(user);
            res.status(200).json({
                sucess: true,
                data: responseDto
            });
        } catch (error) {
            next(error);
        }
    }
}

//*TODO: UpdateUserProfile
