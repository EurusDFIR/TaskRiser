// monolithic-core/pages/api/users/me.js
import prisma from '../../../lib/prisma';
import withAuth from '../../../lib/middlewares/withAuth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { userId } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { // Chỉ chọn các trường cần thiết, không trả về passwordHash
        id: true,
        username: true,
        email: true,
        totalExp: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export default withAuth(handler);