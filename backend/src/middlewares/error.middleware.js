const { sendError } = require('../utils/apiResponse');

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  return sendError(res, 404, `API route not found - ${req.originalUrl}`);
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('💥 Unhandled Error:', err);

  // Mongoose bad ObjectId format (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return sendError(res, 400, `Invalid ID format: ${err.value}`);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, 409, `Duplicate value entered for '${field}'. Please use another value.`, [
      { field, message: `${field} already exists` },
    ]);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    return sendError(res, 400, 'Database validation error', errors);
  }

  // SyntaxError in JSON body parsing
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 400, 'Invalid JSON body syntax');
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, statusCode, message);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
