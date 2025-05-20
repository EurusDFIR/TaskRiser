import prisma from '../../../lib/prisma';
import withAuth from '../../../lib/middlewares/withAuth';

/**
 * API để cập nhật EXP của người dùng
 * 
 * Method: POST
 * Body: { expAmount: number }
 */
async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }

    const { userId } = req.user;
    const { expAmount } = req.body;

    // Kiểm tra xem expAmount có phải là một số hợp lệ không
    if (!expAmount || isNaN(parseInt(expAmount)) || parseInt(expAmount) <= 0) {
        return res.status(400).json({
            message: 'Invalid exp amount. Must be a positive number.'
        });
    }

    try {
        // Lấy thông tin người dùng hiện tại
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                totalExp: true
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Cập nhật tổng EXP cho người dùng
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                totalExp: user.totalExp + parseInt(expAmount),
                updatedAt: new Date() // Cập nhật thời gian để phục vụ cho bộ lọc theo thời gian
            },
            select: {
                id: true,
                username: true,
                totalExp: true,
                createdAt: true,
                updatedAt: true
            }
        });

        // Trả về thông tin người dùng đã cập nhật
        return res.status(200).json({
            message: `Successfully awarded ${expAmount} EXP to ${user.username}.`,
            previousExp: user.totalExp,
            newExp: updatedUser.totalExp,
            expGained: parseInt(expAmount),
            user: updatedUser
        });

    } catch (error) {
        console.error('Update EXP error:', error);
        return res.status(500).json({
            message: 'Failed to update EXP',
            error: error.message
        });
    }
}

// Bảo vệ API route bằng middleware xác thực
export default withAuth(handler); 