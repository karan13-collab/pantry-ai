const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Get token from the 'Authorization' header
  const authHeader = req.header('Authorization');

  // 2. Check if header exists
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // 3. Extract the token (Remove 'Bearer ' string if present)
    // Frontends often send: "Bearer eyJhbGci..."
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7, authHeader.length).trim() 
      : authHeader;

    // 4. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};