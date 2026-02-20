/**
 * Custom application error classes for structured error handling.
 */

export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly details?: Record<string, string[]>;

    constructor(
        message: string,
        code: string,
        statusCode: number,
        details?: Record<string, string[]>
    ) {
        super(message);
        this.name = "AppError";
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: Record<string, string[]>) {
        super(message, "VALIDATION_ERROR", 400, details);
        this.name = "ValidationError";
    }
}

export class AuthenticationError extends AppError {
    constructor(message = "Authentication required") {
        super(message, "UNAUTHORIZED", 401);
        this.name = "AuthenticationError";
    }
}

export class AuthorizationError extends AppError {
    constructor(message = "Insufficient permissions") {
        super(message, "FORBIDDEN", 403);
        this.name = "AuthorizationError";
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, "NOT_FOUND", 404);
        this.name = "NotFoundError";
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, "CONFLICT", 409);
        this.name = "ConflictError";
    }
}

export class RateLimitError extends AppError {
    constructor(message = "Too many requests") {
        super(message, "RATE_LIMITED", 429);
        this.name = "RateLimitError";
    }
}
