// monolithic-core/lib/middlewares/withAuth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const withAuth = (handler) => {
  return async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication token required' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Gắn thông tin user đã giải mã vào request
      return handler(req, res);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      console.error('Authentication error:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};

export default withAuth;