const customSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  res.removeHeader('X-Powered-By');
  
  next();
};

module.exports = customSecurityHeaders;