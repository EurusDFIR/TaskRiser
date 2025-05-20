import prisma from '../../../lib/prisma';

// Danh sách tên người dùng theo chủ đề Solo Leveling
const hunterNames = [
    'Shadow Monarch', 'Beast Monarch', 'Iron Monarch',
    'Void Walker', 'Gate Hunter', 'Dungeon Slayer',
    'Crimson Fang', 'Azure Knight', 'Frost Hunter',
    'Flame Lord', 'Lightning Bearer', 'Stone Fist',
    'Wind Dancer', 'Ocean Master', 'Earth Shaker',
    'Mystic Seeker', 'Silent Blade', 'Dark Reaver',
    'Rune Carver', 'Star Gazer', 'Phantom Assassin',
    'Dragon Knight', 'Demon Slayer', 'Angel Hunter'
];

// Danh sách avatar URLs mẫu (tùy chọn)
const avatarUrls = [
    null, // Nhiều người dùng không có avatar
    'https://via.placeholder.com/150/3498db/FFFFFF?text=H',
    'https://via.placeholder.com/150/2980b9/FFFFFF?text=S',
    'https://via.placeholder.com/150/e74c3c/FFFFFF?text=R',
    'https://via.placeholder.com/150/9b59b6/FFFFFF?text=G',
    'https://via.placeholder.com/150/f1c40f/FFFFFF?text=K'
];

// Hàm tạo mức EXP ngẫu nhiên theo phân bố hợp lý
function generateRandomExp() {
    // Tạo phân bố của EXP để có một số ít người dùng cấp cao và nhiều người dùng cấp thấp
    const rank = Math.random();

    if (rank > 0.98) { // 2% là National Level
        return 10000 + Math.floor(Math.random() * 5000);
    } else if (rank > 0.95) { // 3% là S+ Rank
        return 5000 + Math.floor(Math.random() * 5000);
    } else if (rank > 0.9) { // 5% là S Rank
        return 2000 + Math.floor(Math.random() * 3000);
    } else if (rank > 0.8) { // 10% là A Rank
        return 1000 + Math.floor(Math.random() * 1000);
    } else if (rank > 0.65) { // 15% là B Rank
        return 600 + Math.floor(Math.random() * 400);
    } else if (rank > 0.45) { // 20% là C Rank
        return 300 + Math.floor(Math.random() * 300);
    } else if (rank > 0.2) { // 25% là D Rank
        return 100 + Math.floor(Math.random() * 200);
    } else { // 20% là E Rank
        return 10 + Math.floor(Math.random() * 90);
    }
}

// Hàm tạo thời gian ngẫu nhiên trong 30 ngày qua
function generateRandomDate() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
}

// Giá trị hash mặc định cho mật khẩu 'password123'
// Đây là một giá trị hashed an toàn tương đương với 'password123' khi sử dụng bcrypt
const DEFAULT_PASSWORD_HASH = '$2b$10$9Pzr0WMYuaJWnA4CqpZeFOOQmvyuWZaKP4D9lM6TTcqaUsxA4Zrx6';

export default async function handler(req, res) {
    // Chỉ cho phép phương thức POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }

    try {
        // Kiểm tra xem đã có người dùng nào chưa để tránh tạo trùng
        const userCount = await prisma.user.count();

        // Lấy danh sách mẫu đã tồn tại để tránh tạo trùng
        const existingUsernames = await prisma.user.findMany({
            select: { username: true }
        });
        const existingNames = existingUsernames.map(u => u.username.toLowerCase());

        // Lọc ra tên chưa tồn tại trong database
        const availableNames = hunterNames.filter(
            name => !existingNames.includes(name.toLowerCase())
        );

        // Nếu không còn tên nào để tạo
        if (availableNames.length === 0) {
            return res.status(200).json({
                message: 'All sample hunter names are already in use. No new users created.'
            });
        }

        // Số lượng người dùng để tạo (tối đa là số tên có sẵn)
        const numberOfUsersToCreate = Math.min(req.body?.count || 10, availableNames.length);

        // Tạo mảng dữ liệu người dùng
        const usersToCreate = [];

        for (let i = 0; i < numberOfUsersToCreate; i++) {
            // Chọn tên ngẫu nhiên từ danh sách tên có sẵn
            const randomIndex = Math.floor(Math.random() * availableNames.length);
            const username = availableNames[randomIndex];

            // Xóa tên đã chọn khỏi danh sách để tránh chọn lại
            availableNames.splice(randomIndex, 1);

            // Tạo email từ tên người dùng
            const email = `${username.toLowerCase().replace(/\s+/g, '.')}@example.com`;

            // Sử dụng giá trị hash mặc định thay vì gọi hàm hash() từ bcrypt
            const passwordHash = DEFAULT_PASSWORD_HASH;

            // Chọn ngẫu nhiên một avatar URL (nhiều người dùng sẽ không có avatar)
            const avatar = avatarUrls[Math.floor(Math.random() * avatarUrls.length)];

            // Tạo mức EXP ngẫu nhiên
            const totalExp = generateRandomExp();

            // Tạo thời gian ngẫu nhiên trong 30 ngày qua
            const createdAt = generateRandomDate();
            const updatedAt = new Date(createdAt.getTime() + Math.random() * (Date.now() - createdAt.getTime()));

            // Thêm vào mảng người dùng cần tạo
            usersToCreate.push({
                username,
                email,
                passwordHash,
                avatar,
                totalExp,
                createdAt,
                updatedAt
            });
        }

        // Tạo tất cả người dùng mới trong một giao dịch
        const createdUsers = await prisma.$transaction(
            usersToCreate.map(userData =>
                prisma.user.create({
                    data: userData,
                    select: {
                        id: true,
                        username: true,
                        totalExp: true,
                        createdAt: true
                    }
                })
            )
        );

        // Trả về kết quả
        return res.status(200).json({
            message: `Successfully created ${createdUsers.length} sample users for ranking.`,
            usersCreated: createdUsers
        });

    } catch (error) {
        console.error('Error seeding ranking users:', error);
        return res.status(500).json({
            message: 'Failed to seed ranking users.',
            error: error.message
        });
    }
} 