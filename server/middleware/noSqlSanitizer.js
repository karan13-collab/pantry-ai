const sanitizeObject = (targetObject) => {
  if (typeof targetObject !== 'object' || targetObject === null) return;

  for (let key in targetObject) {
    if (key.startsWith('$') || key.includes('.')) {
      delete targetObject[key];
    } 
    else if (typeof targetObject[key] === 'object') {
      sanitizeObject(targetObject[key]);
    }
  }
};

const customNoSqlSanitizer = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  
  next();
};

module.exports = customNoSqlSanitizer;