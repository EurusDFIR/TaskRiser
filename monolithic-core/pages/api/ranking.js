// monolithic-core/pages/api/ranking.js
import prisma from '../../lib/prisma';
// Không cần withAuth nếu bảng xếp hạng là public, nếu muốn private thì thêm withAuth
// import withAuth from '../../lib/middlewares/withAuth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const topUsers = await prisma.user.findMany({
      take: 10, // Lấy top 10 users
      orderBy: {
        totalExp: 'desc', // Sắp xếp theo totalExp giảm dần
      },
      select: { // Chỉ chọn các trường cần thiết
        id: true,
        username: true,
        totalExp: true,
        // Không nên trả về email hoặc các thông tin nhạy cảm khác ở đây
      },
    });

    res.status(200).json(topUsers);
  } catch (error) {
    console.error('Get ranking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// export default withAuth(handler); // Nếu muốn ranking cần đăng nhập
export default handler; // Nếu ranking là public