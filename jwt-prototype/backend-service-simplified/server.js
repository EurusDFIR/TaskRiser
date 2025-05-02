//backend-service-simplified\server.js

require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const port = 8081;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET){
    console.error("Loi: Bien moi truong JWT_SECRET chua duoc dat!");
    process.exit(1);
}

app.use(express.json());

// Endpoint "đăng nhập" giả lập -> Tạo JWT
app.post('/login', (req, res) => {

    // Giả lập xác thực thành công với user ID = 123
    const userId = 123;
    const payload = { userId: userId, username: 'testuser' }; // Thêm thông tin cần thiết vào payload

    // Tạo JWT có thời hạn 1 giờ (1h)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    console.log(`[Backend] Đã tạo JWT cho người dùng ${userId}`);
    res.json({ message: "Đăng nhập thành công (giả lập)", token });
});

// Endpoint được bảo vệ giả lập
// Endpoint này TIN TƯỞNG user ID được gửi từ API Gateway
app.get('/my-tasks', (req, res) => {
    const userIdFromGateway = req.headers['x-user-id']; // Lấy header tùy chỉnh từ Gateway

    if (!userIdFromGateway) {
        // Nếu không có header này, có thể request đi trực tiếp hoặc Gateway cấu hình sai
        console.log('[Backend] Yêu cầu đến /my-tasks bị từ chối: Thiếu thông tin người dùng từ Gateway.');
        return res.status(401).json({ error: 'Unauthorized: Missing user information from Gateway.' });
    }

    console.log(`[Backend] Nhận yêu cầu /my-tasks từ người dùng ${userIdFromGateway}`);
    // Giả lập trả về dữ liệu task cho user đó
    res.json([
        { id: 1, title: `Nhiệm vụ 1 của người dùng ${userIdFromGateway}` },
        { id: 2, title: `Nhiệm vụ 2 của người dùng ${userIdFromGateway}` },
    ]);
});

app.listen(port, () => {
    console.log(`[Backend Service Simplified] đang chạy tại http://localhost:${port}`);
});