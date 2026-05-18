const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token bulunamadı' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Geçersiz token' });
  }
};

const authorMiddleware = (req, res, next) => {
  if (req.user.role !== 'author') {
    return res.status(403).json({ error: 'Bu işlem için yazar yetkisi gereklidir' });
  }
  next();
};

module.exports = { authMiddleware, authorMiddleware };