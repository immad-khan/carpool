class ApiError extends Error {
  constructor(statusCode, code, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details) {
    return new ApiError(400, 'VALIDATION_ERROR', message, details);
  }
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, 'FORBIDDEN', message);
  }
  static notFound(message = 'Not found') {
    return new ApiError(404, 'NOT_FOUND', message);
  }
  static conflict(message = 'Conflict') {
    return new ApiError(409, 'CONFLICT', message);
  }
  static unprocessable(message = 'Unprocessable entity') {
    return new ApiError(422, 'UNPROCESSABLE_ENTITY', message);
  }
  static gone(message = 'Gone') {
    return new ApiError(410, 'GONE', message);
  }
  static tooMany(message = 'Too many requests') {
    return new ApiError(429, 'RATE_LIMITED', message);
  }
  static payloadTooLarge(message = 'Payload too large') {
    return new ApiError(413, 'PAYLOAD_TOO_LARGE', message);
  }
}

module.exports = ApiError;
