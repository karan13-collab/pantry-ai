const AuditLog = require('../models/AuditLog');

const logSecurityEvent = async (req, email, action, status) => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'];

    await AuditLog.create({
      email,
      action,
      status,
      ipAddress,
      userAgent
    });
  } catch (error) {
    console.error("Audit Logging Failed:", error.message);
  }
};

module.exports = logSecurityEvent;