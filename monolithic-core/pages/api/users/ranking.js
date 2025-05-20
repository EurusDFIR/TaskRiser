import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }

    try {
        // Lấy các query parameters
        const { filter = 'all', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Tạo điều kiện thời gian nếu filter là 'week' hoặc 'month'
        let dateFilter = {};
        if (filter === 'week') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            dateFilter = {
                updatedAt: {
                    gte: oneWeekAgo
                }
            };
        } else if (filter === 'month') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            dateFilter = {
                updatedAt: {
                    gte: oneMonthAgo
                }
            };
        }

        // Đếm tổng số người dùng
        const totalUsers = await prisma.user.count({
            where: dateFilter
        });

        // Lấy danh sách người dùng được sắp xếp theo totalExp
        const users = await prisma.user.findMany({
            where: dateFilter,
            select: {
                id: true,
                username: true,
                totalExp: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                totalExp: 'desc',
            },
            skip,
            take: limitNum,
        });

        // Trả về kết quả
        res.status(200).json({
            players: users,
            totalPages: Math.ceil(totalUsers / limitNum),
            currentPage: pageNum,
            totalUsers
        });
    } catch (error) {
        console.error('Ranking API error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
} 