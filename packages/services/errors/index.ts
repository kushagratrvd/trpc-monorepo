export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: unknown;

    constructor(statusCode: number, message: string, code: string, details?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        
        // Ensure proper prototype chain for inheritance
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public static badRequest(message: string, code = "BAD_REQUEST", details?: unknown) {
        return new ApiError(400, message, code, details);
    }

    public static unauthorized(message: string, code = "UNAUTHORIZED") {
        return new ApiError(401, message, code);
    }

    public static forbidden(message: string, code = "FORBIDDEN") {
        return new ApiError(403, message, code);
    }

    public static notFound(message: string, code = "NOT_FOUND") {
        return new ApiError(404, message, code);
    }

    public static conflict(message: string, code = "CONFLICT") {
        return new ApiError(409, message, code);
    }

    public static internal(message: string = "Internal Server Error", code = "INTERNAL_ERROR") {
        return new ApiError(500, message, code);
    }
}

export default ApiError;
