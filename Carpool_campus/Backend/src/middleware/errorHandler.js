const ApiError = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      issue: e.message,
    }));
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details },
    });
  }

  // Mongo duplicate key
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: 'Duplicate resource', details: err.keyValue },
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
}

module.exports = { errorHandler, notFoundHandler };
