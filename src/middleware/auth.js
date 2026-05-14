function checkAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
}

function checkAdmin(req, res, next) {
  if (req.session.userId && req.session.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin only.' });
  }
}

module.exports = { checkAuth, checkAdmin };
