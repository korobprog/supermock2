"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.InternalServerError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.ApiError = void 0;
// Custom error class for API errors
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        this.stack = stack;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.ApiError = ApiError;
// Common error types
class BadRequestError extends ApiError {
    constructor(message = 'Bad Request') {
        super(400, message);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized') {
        super(401, message);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden') {
        super(403, message);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends ApiError {
    constructor(message = 'Not Found') {
        super(404, message);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends ApiError {
    constructor(message = 'Conflict') {
        super(409, message);
    }
}
exports.ConflictError = ConflictError;
class InternalServerError extends ApiError {
    constructor(message = 'Internal Server Error') {
        super(500, message, false);
    }
}
exports.InternalServerError = InternalServerError;
// Error handler middleware
const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json(Object.assign({ status: 'error', message: err.message }, (process.env.NODE_ENV === 'development' && { stack: err.stack })));
        return;
    }
    // Handle unknown errors
    console.error('Unhandled error:', err);
    res.status(500).json(Object.assign({ status: 'error', message: 'Internal Server Error' }, (process.env.NODE_ENV === 'development' && { stack: err.stack })));
};
exports.errorHandler = errorHandler;
