export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Bevara prototypkedjan
        Object.setPrototypeOf(this, new.target.prototype);

        Error.captureStackTrace(this);
    }
}
