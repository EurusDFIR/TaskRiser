// client-script/test_api.js
require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const API_GATEWAY_URL = 'http://localhost:8080';
let jwtToken = null;

// --- Các hàm tiện ích tạo token test ---
function createExpiredToken() {
    const payload = { userId: 456, username: 'expiredUser' };
    // Ký token với thời gian hết hạn là -1 giờ (đã hết hạn ngay lập tức)
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '-1h' });
}

function createInvalidSignatureToken() {
    const payload = { userId: 789, username: 'invalidUser' };
    const WRONG_SECRET = 'wrong-secret-key-that-does-not-match';
    // Ký token với một secret key sai
    return jwt.sign(payload, WRONG_SECRET, { expiresIn: '1h' });
}

// --- Các hàm gọi API ---
async function login() {
    try {
        console.log('\n--- [Client] Đang đăng nhập... ---');
        const response = await axios.post(`${API_GATEWAY_URL}/login`, {
            // Có thể gửi username/password giả lập nếu backend cần
        });
        jwtToken = response.data.token;
        console.log('[Client] Đăng nhập thành công! JWT nhận được:', jwtToken);
        return jwtToken;
    } catch (error) {
        console.error('[Client] Đăng nhập thất bại:', error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message);
        return null;
    }
}

async function getMyTasks(token) {
    const description = token ? (token === jwtToken ? 'Token Hợp Lệ' : 'Token Test Không Hợp Lệ') : 'Không có Token';
    console.log(`\n--- [Client] Đang lấy tasks với: ${description} ---`);
    try {
        const config = {};
        if (token) {
            config.headers = { Authorization: `Bearer ${token}` };
        }
        const response = await axios.get(`${API_GATEWAY_URL}/my-tasks`, config);
        console.log('[Client] Lấy tasks thành công! Status:', response.status, 'Data:', response.data);
    } catch (error) {
        console.error('[Client] Lấy tasks thất bại:', error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message);
    }
}

// --- Chạy các kịch bản test ---
async function runTests() {
    console.log('*** BẮT ĐẦU CHẠY PROTOTYPE KIỂM TRA JWT ***');

    // 1. Đăng nhập để lấy token hợp lệ
    const validToken = await login();

    // 2. Gọi API với token hợp lệ
    if (validToken) {
        await getMyTasks(validToken);
    } else {
        console.log('[Client] Không thể tiếp tục vì đăng nhập thất bại.');
        return; // Dừng nếu không đăng nhập được
    }

    // 3. Gọi API không có token
    await getMyTasks(null);

    // 4. Gọi API với token hết hạn
    const expiredToken = createExpiredToken();
    await getMyTasks(expiredToken);

    // 5. Gọi API với token sai chữ ký
    const invalidSigToken = createInvalidSignatureToken();
    await getMyTasks(invalidSigToken);

    console.log('\n*** KẾT THÚC PROTOTYPE KIỂM TRA JWT ***');
}

runTests();