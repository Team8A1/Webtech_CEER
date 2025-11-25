const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const facultyOnly = (req, res, next) => {
  if (req.user.role !== 'faculty') {
    return res.status(403).json({ error: 'Access denied. Faculty only.' });
  }
  next();
};

const labInchargeOnly = (req, res, next) => {
  if (req.user.role !== 'labincharge') {
    return res.status(403).json({ error: 'Access denied. Lab-Incharge only.' });
  }
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

const studentOnly = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Access denied. Student only.' });
  }
  next();
};

module.exports = { auth, facultyOnly, labInchargeOnly, adminOnly, studentOnly };
