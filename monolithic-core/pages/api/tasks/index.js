// monolithic-core/pages/api/tasks/index.js
import prisma from '../../../lib/prisma';
import withAuth from '../../../lib/middlewares/withAuth'; // Import middleware

async function handler(req, res) {
  // req.user sẽ chứa thông tin user từ token (ví dụ: { userId: 1, username: 'testuser1', ... })
  const { userId } = req.user;

  if (req.method === 'POST') {
    // Tạo Task mới
    const { title, difficulty } = req.body;

    if (!title || !difficulty) {
      return res.status(400).json({ message: 'Title and difficulty are required' });
    }

    // Kiểm tra difficulty có hợp lệ không (tùy chọn, có thể làm ở schema Prisma)
    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({ message: 'Invalid difficulty. Must be Easy, Medium, or Hard.' });
    }

    try {
      const newTask = await prisma.task.create({
        data: {
          title,
          difficulty,
          userId: userId, // Gán task cho user hiện tại
        },
      });
      res.status(201).json(newTask);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'GET') {
    // Lấy danh sách Task của user
    try {
      const tasks = await prisma.task.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          createdAt: 'desc', // Sắp xếp theo thời gian tạo mới nhất
        },
      });
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}

export default withAuth(handler); // Bọc handler bằng middleware xác thực