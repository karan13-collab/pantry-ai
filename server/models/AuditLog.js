const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true 
  },
  action: { 
    type: String, 
    required: true,
    enum: ['LOGIN_SUCCESS', 'LOGIN_FAILURE', 'ACCOUNT_LOCKED', 'PASSWORD_RESET', 'LOGOUT'] 
  },
  status: {
    type: String,
    required: true,
    enum: ['SUCCESS', 'FAILURE', 'WARNING']
  },
  ipAddress: { 
    type: String 
  },
  userAgent: { 
    type: String 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);