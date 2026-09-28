const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenCookieOptions,
} = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'An account with this email already exists.', [
        { field: 'email', message: 'Email is already registered' },
      ]);
    }

    // Create new user (password is automatically hashed by Mongoose pre-save hook)
    const newUser = new User({
      name,
      email,
      password,
    });

    await newUser.save();

    // Return created user without password and without tokens (as per assignment specs)
    return sendSuccess(res, 201, 'User registered successfully. Please log in.', {
      user: newUser.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & issue tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    // Verify password with bcrypt.compare
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    // Generate tokens
    const accessToken = generateAccessToken({ id: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Persist refresh token in DB for revocation
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token in httpOnly, secure cookie
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    return sendSuccess(res, 200, 'Login successful.', {
      accessToken,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Issue a new access token using valid refresh token
 * @route   POST /api/auth/refresh-token
 * @access  Public (Requires valid refresh token in cookie or body)
 */
const refreshToken = async (req, res, next) => {
  try {
    // Read refresh token from httpOnly cookie (fallback to body if present)
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return sendError(
        res,
        401,
        'Refresh token not found. Please log in to obtain a new session.'
      );
    }

    // Verify token signature & expiry
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      return sendError(
        res,
        401,
        'Refresh token is invalid or has expired. Please log in again.'
      );
    }

    // Verify token against database record
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return sendError(
        res,
        403,
        'Refresh token is revoked or reuse detected. Please log in again.'
      );
    }

    // Issue new access token and rotate refresh token
    const newAccessToken = generateAccessToken({ id: user._id, email: user.email });
    const newRefreshToken = generateRefreshToken({ id: user._id });

    // Update DB with rotated refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());

    return sendSuccess(res, 200, 'Access token refreshed successfully.', {
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user & invalidate refresh token
 * @route   POST /api/auth/logout
 * @access  Authenticated / Refresh token owner
 */
const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (token) {
      // Invalidate stored refresh token in DB
      await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null });
    } else if (req.user) {
      // Invalidate for authenticated user
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }

    // Clear the httpOnly cookie
    const cookieOptions = getRefreshTokenCookieOptions();
    delete cookieOptions.maxAge;
    res.clearCookie('refreshToken', cookieOptions);

    return sendSuccess(res, 200, 'Logged out successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user's profile
 * @route   GET /api/auth/me
 * @access  Authenticated
 */
const getMe = async (req, res) => {
  return sendSuccess(res, 200, 'User profile fetched successfully.', {
    user: req.user,
  });
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};
