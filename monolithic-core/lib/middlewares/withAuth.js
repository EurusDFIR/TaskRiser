// monolithic-core/lib/middlewares/withAuth.js
import jwt from 'jsonwebtoken';
import { getToken } from 'next-auth/jwt';
import dotenv from 'dotenv';

dotenv.config();

const withAuth = (handler) => {
  return async (req, res) => {
    // First try to get a NextAuth session
    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (session) {
      // User is authenticated with NextAuth
      req.user = {
        userId: session.id || session.sub,
        email: session.email,
        username: session.username || session.name,
      };
      return handler(req, res);
    }

    // If no NextAuth session, try JWT token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication token required' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach decoded user info to request
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