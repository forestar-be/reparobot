const logger = require('../config/logger');
const { verify } = require('jsonwebtoken');

const SECRET_KEY = 'your-secret-key'; // TODO move to env variable

function authenticateToken(req, res, next) {
  if (req.path === '/login') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
