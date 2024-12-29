import express, { NextFunction, Request, Response } from 'express';
import logger from './utils/logger.js';
import globalErrorHandler from './middlewares/errorhandler.js';
import { loggingHandler } from './middlewares/loggingHandler.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
app.use(express.json());
app.use(loggingHandler);

app.use('/api/users', userRoutes);

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the API!'
    });
});

app.use(globalErrorHandler);

export default app;
