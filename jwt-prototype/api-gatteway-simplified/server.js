// api-gateway-simplified/server.js
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const axios = require('axios'); // <<<--- Thêm axios để gọi backend

const app = express();
const port = 8080;
const JWT_SECRET = process.env.JWT_SECRET;
const BACKEND_SERVICE_URL = 'http://localhost:8081';

if (!JWT_SECRET) {
    console.error("Lỗi: Biến môi trường JWT_SECRET chưa được đặt!");
    process.exit(1);
}


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token == null) {
        console.log('[Gateway] Yêu cầu bị từ chối: Không tìm thấy token.');
        return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedPayload) => {
        if (err) {
            console.log('[Gateway] Yêu cầu bị từ chối: Token không hợp lệ hoặc hết hạn -', err.message);
            return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
        }

        req.userId = decodedPayload.userId;
        console.log(`[Gateway] Xác thực thành công người dùng ${req.userId} cho ${req.path}`);
        next();
    });
};


const loginProxy = createProxyMiddleware({
    target: BACKEND_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/login': '/login' },
    onProxyReq: fixRequestBody,
    onError: (err, req, res) => { console.error('[Gateway] Lỗi Proxy cho /login:', err); res.status(502).json({ error: 'Bad Gateway - Login Proxy Error' }); }
});
app.post('/login', loginProxy);




app.get('/my-tasks', authenticateToken, async (req, res) => {

    const userId = req.userId;

    if (!userId) {

        console.error('[Gateway] Lỗi nghiêm trọng: userId không tồn tại sau khi xác thực!');
        return res.status(500).json({ error: 'Internal Server Error' });
    }

    try {
        console.log(`[Gateway] Gọi Backend Service GET /my-tasks cho người dùng ${userId}`);
        // Tự gọi Backend Service bằng axios, thêm header X-User-ID
        const backendResponse = await axios.get(`${BACKEND_SERVICE_URL}/my-tasks`, {
            headers: {
                'X-User-ID': userId // Gửi header chứa user ID đã xác thực
                // Có thể cần forward thêm các header khác từ client nếu backend cần
            }
        });

        // Gửi response từ Backend về lại Client
        console.log(`[Gateway] Nhận phản hồi thành công từ Backend cho user ${userId}`);
        res.status(backendResponse.status).json(backendResponse.data);

    } catch (error) {
        console.error(`[Gateway] Lỗi khi gọi Backend Service /my-tasks cho user ${userId}:`, error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message);
        // Trả về lỗi cho client
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(502).json({ error: 'Bad Gateway - Cannot reach backend service' }); // Lỗi kết nối đến backend
        }
    }
});


// Xử lý lỗi 404 chung
app.use((req, res) => {
    console.log(`[Gateway] Yêu cầu không khớp: ${req.method} ${req.path}`);
    res.status(404).send(`Cannot ${req.method} ${req.path}`);
});


app.listen(port, () => {
    console.log(`[API Gateway Simplified] đang chạy tại http://localhost:${port}`);
});