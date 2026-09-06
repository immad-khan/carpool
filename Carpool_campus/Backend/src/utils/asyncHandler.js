// Kept for explicitness even though express-async-errors auto-catches;
// use this if you ever disable that package.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
