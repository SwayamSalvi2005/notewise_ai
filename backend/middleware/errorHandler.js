

const errorHandler = (err, req, res, next) => {

    // Log the full error on the server (never send stack traces to clients)
    console.error("Error:", err);

    let statusCode = err.statusCode || 500;
    let message    = "Something went wrong. Please try again later.";

    // ── Auth errors (JWT) ──────────────────────────────────────────────────────
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        statusCode = 401;
        message    = "Authentication failed. Please login again.";
    }

    // ── Multer file size limit exceeded ───────────────────────────────────────
    // Multer sets err.code = "LIMIT_FILE_SIZE" when the file is too large
    if (err.code === "LIMIT_FILE_SIZE") {
        statusCode = 400;
        message    = "Uploaded file is too large.";
    }

    // ── MongoDB duplicate key (e.g. email or username already taken) ──────────
    // MongoDB error code 11000 means a unique index constraint was violated
    if (err.code === 11000) {
        statusCode = 400;
        message    = "Duplicate data already exists.";
    }

    // ── MongoDB connection failure ─────────────────────────────────────────────
    if (err.name === "MongoNetworkError") {
        message    = "Server down please try again later";
        statusCode = 503;
    }

    // ── AI errors (from AppError with custom type field) ──────────────────────
    // "rateLimit" — Gemini API quota exceeded
    if (err.type === "rateLimit") {
        message = err.message; // use our pre-written user-friendly message
    }

    // "tokenLimit" — document text was too long for the AI model
    if (err.type === "tokenLimit") {
        message = err.message;
    }

    // ── PDF parsing error ──────────────────────────────────────────────────────
    if (err.type === "pdf") {
        message = err.message;
    }

    // Always send JSON (never HTML) for API errors
    res.status(statusCode).json({
        success: false,
        error:   message
    });
};

export default errorHandler;
