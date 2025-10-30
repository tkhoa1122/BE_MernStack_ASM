const jwt = require('jsonwebtoken');
const Members = require('../models/Member');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(user) {
  return jwt.sign({ sub: user._id, isAdmin: user.isAdmin }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

async function attachUserFromToken(req, res, next) {
  const token = req.cookies && req.cookies.token;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await Members.findById(payload.sub).lean();
    if (user) {
      req.user = { _id: user._id.toString(), email: user.email, name: user.name, isAdmin: !!user.isAdmin };
      res.locals.currentUser = req.user;
    }
  } catch (e) {
    // ignore invalid token
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    if (req.accepts('html')) 
      return res.redirect('/login');
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin required' });
  }
  next();
}

function requireSelfOrAdmin(paramIdField = 'id') {
  return (req, res, next) => {
    const targetId = req.params[paramIdField] || req.body.id || req.body._id;
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (req.user.isAdmin) return next();
    if (!targetId) return res.status(400).json({ message: 'Target id missing' });
    if (req.user._id === String(targetId)) return next();
    return res.status(403).json({ message: 'You can only modify your own account' });
  };
}

module.exports = { signToken, attachUserFromToken, requireAuth, requireAdmin, requireSelfOrAdmin };
