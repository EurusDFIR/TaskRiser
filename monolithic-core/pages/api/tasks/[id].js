// monolithic-core/pages/api/tasks/[id].js
import prisma from '../../../lib/prisma';
import withAuth from '../../../lib/middlewares/withAuth';

async function handler(req, res) {
  const { userId } = req.user; // User ID từ token
  const taskId = parseInt(req.query.id); // Lấy ID task từ URL

  if (isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid Task ID' });
  }

  // Kiểm tra task có tồn tại và thuộc về user hiện tại không
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (task.userId !== userId) {
    return res.status(403).json({ message: 'Forbidden: You do not own this task' });
  }

  // Xử lý các method khác nhau
  if (req.method === 'PUT') {
    // Cập nhật Task (chủ yếu là status)
    const { title, difficulty, status } = req.body;

    // Validate status (tùy chọn, có thể làm ở schema Prisma)
    const validStatuses = ['Pending', 'Completed'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be Pending or Completed.' });
    }

    try {
      const updatedTaskData = {};
      if (title) updatedTaskData.title = title;
      if (difficulty) updatedTaskData.difficulty = difficulty;
      if (status) updatedTaskData.status = status;


      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: updatedTaskData,
      });

      // --- LOGIC TÍNH EXP ĐƠN GIẢN ---
      if (updatedTask.status === 'Completed') {
        let expGained = 0;
        if (updatedTask.difficulty === 'E-Rank') expGained = 10;
        else if (updatedTask.difficulty === 'D-Rank') expGained = 20;
        else if (updatedTask.difficulty === 'C-Rank') expGained = 30;
        else if (updatedTask.difficulty === 'B-Rank') expGained = 40;
        else if (updatedTask.difficulty === 'A-Rank') expGained = 50;
        else if (updatedTask.difficulty === 'S-Rank') expGained = 100;

        if (expGained > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              totalExp: {
                increment: expGained, // Tăng totalExp của user
              },
            },
          });
          console.log(`User ${userId} gained ${expGained} EXP for completing task ${taskId}`);
        }
      }
      // --- HẾT LOGIC TÍNH EXP ---

      res.status(200).json(updatedTask);
    } catch (error) {
      console.error(`Update task ${taskId} error:`, error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    // Xóa Task
    try {
      await prisma.task.delete({
        where: { id: taskId },
      });
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error(`Delete task ${taskId} error:`, error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'GET') {
     // Lấy chi tiết một Task (tùy chọn, nếu cần)
     res.status(200).json(task); // Trả về task đã lấy được ở phần kiểm tra ownership
  }
   else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}

export default withAuth(handler);