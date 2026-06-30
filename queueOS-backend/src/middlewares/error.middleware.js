/**
 * Global Error Handler Middleware
 * Intercepts all errors thrown by endpoints and ensures the server 
 * doesn't crash, instead returning a clean JSON format.
 */
const errorHandler = (err, req, res, next) => {
    console.error(`[Global Error] ${err.message}`);
    
    // Default to 500 if no status code is provided
    const statusCode = err.statusCode || 500;
    
    res.status(statusCode).json({
        success: false,
        error: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "production" ? null : err.stack
    });
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: `API Route Not Found - ${req.originalUrl}`
    });
};

module.exports = { errorHandler, notFoundHandler };
