
// A custom Error class so we can attach extra info
//          (like statusCode and type) to thrown errors.
export class AppError extends Error {
    constructor(message, type, statusCode = 500, originalError) {
        super(message); // calls the parent Error constructor with the message
        this.type          = type;          // e.g. "pdf", "gemini", "rateLimit", "tokenLimit"
        this.statusCode    = statusCode;    // HTTP status code to send to client
        this.originalError = originalError; // the raw error (useful for logging/debugging)
    }
}
