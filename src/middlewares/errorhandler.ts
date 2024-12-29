import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';
import { AppError } from '../utils/AppError.js';

const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    if (res.headersSent) {
        return next(err);
    }

    const environment = process.env.NODE_ENV || 'development';

    // Operativa fel (AppError)
    if (err instanceof AppError) {
        logger.warn(`Operational Error: ${err.message}`);
        res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    // Oväsentliga fel
    const errorDetails = {
        route: `${req.method} ${req.originalUrl}`,
        body: Object.keys(req.body || {}).length ? req.body : null,
        params: Object.keys(req.params || {}).length ? req.params : null,
        query: Object.keys(req.query || {}).length ? req.query : null
    };

    logger.error(err.message, { stack: err.stack, ...errorDetails });

    res.status(500).json({
        success: false,
        message: environment === 'development' ? err.message : 'An unexpected error occurred.',
        ...(environment === 'development' && { stack: err.stack })
    });
};

export default globalErrorHandler;
