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
    // Cập nhật Task (status và các trường khác)
    const {
      title,
      difficulty,
      status,
      description,
      dueDate,
      priority,
      tags
    } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'InProgress', 'OnHold', 'Completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: Pending, InProgress, OnHold, Completed.' });
    }

    // Validate difficulty if provided
    if (difficulty) {
      const validDifficulties = ['E-Rank', 'D-Rank', 'C-Rank', 'B-Rank', 'A-Rank', 'S-Rank'];
      if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({ message: 'Invalid difficulty. Must be one of: ' + validDifficulties.join(', ') });
      }
    }

    // Validate priority if provided
    if (priority) {
      const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ message: 'Invalid priority. Must be one of: ' + validPriorities.join(', ') });
      }
    }

    try {
      // Build the update data object
      const updatedTaskData = {};
      if (title) updatedTaskData.title = title;
      if (difficulty) updatedTaskData.difficulty = difficulty;
      if (status) updatedTaskData.status = status;
      if (description !== undefined) updatedTaskData.description = description;
      if (priority) updatedTaskData.priority = priority;

      // Handle due date (allowing null to remove the date)
      if (dueDate === null) {
        updatedTaskData.dueDate = null;
      } else if (dueDate) {
        updatedTaskData.dueDate = new Date(dueDate);
      }

      // Handle tags if provided
      if (tags !== undefined) {
        updatedTaskData.tags = Array.isArray(tags) ? JSON.stringify(tags) : tags;
      }

      console.log(`Updating task ${taskId} with data:`, updatedTaskData);

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: updatedTaskData,
      });

      // Parse tags if they are stored as a JSON string
      if (updatedTask.tags && typeof updatedTask.tags === 'string') {
        try {
          updatedTask.tags = JSON.parse(updatedTask.tags);
        } catch (e) {
          console.error('Error parsing tags:', e);
        }
      }

      // --- LOGIC TÍNH EXP ĐƠN GIẢN ---
      if (status === 'Completed' && task.status !== 'Completed') {
        // Only award EXP if the task is being marked as completed for the first time
        let expGained = updatedTask.expReward;

        // If expReward isn't set in the database, calculate it based on difficulty
        if (!expGained) {
          if (updatedTask.difficulty === 'E-Rank') expGained = 10;
          else if (updatedTask.difficulty === 'D-Rank') expGained = 20;
          else if (updatedTask.difficulty === 'C-Rank') expGained = 30;
          else if (updatedTask.difficulty === 'B-Rank') expGained = 40;
          else if (updatedTask.difficulty === 'A-Rank') expGained = 50;
          else if (updatedTask.difficulty === 'S-Rank') expGained = 100;
        }

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
      res.status(500).json({ message: 'Internal server error', error: error.message });
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
    // Lấy chi tiết một Task
    // Parse tags if they are stored as a JSON string
    if (task.tags && typeof task.tags === 'string') {
      try {
        task.tags = JSON.parse(task.tags);
      } catch (e) {
        console.error('Error parsing tags:', e);
      }
    }
    res.status(200).json(task);
  }
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}

export default withAuth(handler);