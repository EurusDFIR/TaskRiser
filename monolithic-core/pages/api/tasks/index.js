// monolithic-core/pages/api/tasks/index.js
import prisma from '../../../lib/prisma';
import withAuth from '../../../lib/middlewares/withAuth'; // Import middleware

async function handler(req, res) {
  // req.user sẽ chứa thông tin user từ token (ví dụ: { userId: 1, username: 'testuser1', ... })
  const { userId } = req.user;

  if (req.method === 'POST') {
    // Tạo Task mới
    const {
      title,
      difficulty,
      description,
      dueDate,
      priority,
      tags,
      status = 'Pending' // Default status if not provided
    } = req.body;

    if (!title || !difficulty) {
      return res.status(400).json({ message: 'Title and difficulty are required' });
    }

    // Kiểm tra difficulty có hợp lệ không
    const validDifficulties = ['E-Rank', 'D-Rank', 'C-Rank', 'B-Rank', 'A-Rank', 'S-Rank'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ message: 'Invalid difficulty. Must be one of: ' + validDifficulties.join(', ') });
    }

    // Kiểm tra status có hợp lệ không
    const validStatuses = ['Pending', 'InProgress', 'OnHold', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
    }

    // Kiểm tra priority có hợp lệ không
    const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority. Must be one of: ' + validPriorities.join(', ') });
    }

    try {
      // Prepare task data
      const taskData = {
        title,
        difficulty,
        status,
        userId, // Gán task cho user hiện tại
      };

      // Add optional fields if provided
      if (description) taskData.description = description;
      if (dueDate) taskData.dueDate = new Date(dueDate);
      if (priority) taskData.priority = priority;

      // Calculate EXP reward based on difficulty
      let expReward = 0;
      if (difficulty === 'E-Rank') expReward = 10;
      else if (difficulty === 'D-Rank') expReward = 20;
      else if (difficulty === 'C-Rank') expReward = 30;
      else if (difficulty === 'B-Rank') expReward = 40;
      else if (difficulty === 'A-Rank') expReward = 50;
      else if (difficulty === 'S-Rank') expReward = 100;

      taskData.expReward = expReward;

      console.log('Creating task with data:', taskData);

      const newTask = await prisma.task.create({
        data: taskData,
      });

      // Process tags if provided
      if (tags && Array.isArray(tags) && tags.length > 0) {
        // For simplicity, we're storing tags as a JSON string in the task
        await prisma.task.update({
          where: { id: newTask.id },
          data: {
            tags: JSON.stringify(tags)
          }
        });

        // Note: In a more complex system, you might want to create a separate tags table
        // and establish a many-to-many relationship
      }

      res.status(201).json(newTask);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
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

      // Parse tags from JSON string to array for each task
      const processedTasks = tasks.map(task => {
        if (task.tags && typeof task.tags === 'string') {
          try {
            return {
              ...task,
              tags: JSON.parse(task.tags)
            };
          } catch (e) {
            return task;
          }
        }
        return task;
      });

      res.status(200).json(processedTasks);
    } catch (error) {
      console.error('Get tasks error:', error);

      // Check for specific database-related errors
      if (error.code === 'P1001' || error.message.includes('database')) {
        return res.status(500).json({
          message: 'Database connection error',
          error: error.message,
          hint: 'Please make sure your PostgreSQL server is running at localhost:5432'
        });
      }

      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}

export default withAuth(handler); // Bọc handler bằng middleware xác thực