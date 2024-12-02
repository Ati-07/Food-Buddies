const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate the JWT token.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The middleware next function.
 */
function authenticate(req, res, next) {
  const token = req.headers['x-auth-token'];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = authenticate;
