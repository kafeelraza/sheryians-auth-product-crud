const { verifyAccessToken } = require('../utils/jwt');
const { sendError } = require('../utils/apiResponse');
const User = require('../models/User');

/**
 * Authentication middleware: Validates the JWT Bearer access token
 * from the Authorization header and attaches the authenticated user to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(
        res,
        401,
        'Access denied. No authentication token provided in Authorization header.'
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return sendError(res, 401, 'Authentication token is malformed or missing.');
    }

    // Verify token with ACCESS_TOKEN_SECRET
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Access token has expired. Please refresh your token.');
      }
      return sendError(res, 401, 'Invalid access token.');
    }

    // Find the user in database to ensure account still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 401, 'User account associated with this token no longer exists.');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 500, `Authentication failed: ${error.message}`);
  }
};

module.exports = { authenticate };
