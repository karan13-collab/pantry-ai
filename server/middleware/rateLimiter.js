const requestTracker = new Map();

setInterval(() => requestTracker.clear(), 60 * 60 * 1000);

const customRateLimiter = (req, res, next) => {
  const ip = req.ip;
  const currentTime = Date.now();
  const windowMs = 15 * 60 * 1000;
  const limit = 100;

  if (!requestTracker.has(ip)) {
    requestTracker.set(ip, { count: 1, startTime: currentTime });
    return next();
  }

  const record = requestTracker.get(ip);

  if (currentTime - record.startTime > windowMs) {
    requestTracker.set(ip, { count: 1, startTime: currentTime });
    return next();
  }

  if (record.count >= limit) {
    return res.status(429).json({ 
      error: 'Too many requests. IP temporarily blocked.' 
    });
  }

  record.count += 1;
  next();
};

module.exports = customRateLimiter;