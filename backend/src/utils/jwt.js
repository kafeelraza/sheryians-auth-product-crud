const jwt = require('jsonwebtoken');

/**
 * Generate a short-lived Access Token (15 mins)
 * @param {Object} payload - { id, email }
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  });
};

/**
 * Generate a long-lived Refresh Token (7 days)
 * @param {Object} payload - { id }
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  });
};

/**
 * Verify Access Token
 * @param {string} token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

/**
 * Verify Refresh Token
 * @param {string} token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

/**
 * Standard cookie options for httpOnly refresh tokens
 */
const getRefreshTokenCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true, // Prevents client-side JS access (XSS defense)
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshTokenCookieOptions,
};
