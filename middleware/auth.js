const jwt = require('jsonwebtoken');

// Middleware to authenticate users
function authenticateUser(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

   console.log('Token:', token);
  console.log('Authorization header:', req.header('Authorization'));


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user information to the request object
    next();
  } catch (err) {
    console.error('Error verifying token:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = { authenticateUser };
