import crypto from 'crypto';

// Tạo CSRF token mới
export function generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Lưu token vào session hoặc cookie
export function setCSRFToken(res) {
    const csrfToken = generateCSRFToken();
    // Thiết lập cookie với HttpOnly và SameSite=Strict để tăng bảo mật
    res.setHeader('Set-Cookie', `csrfToken=${csrfToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600`);
    return csrfToken;
}

// Xác thực CSRF token
export function validateCSRFToken(req, token) {
    // Lấy token từ cookie
    const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});

    const storedToken = cookies?.csrfToken;

    if (!storedToken || !token) {
        return false;
    }

    // So sánh constant-time để tránh timing attacks
    try {
        return crypto.timingSafeEqual(
            Buffer.from(storedToken),
            Buffer.from(token)
        );
    } catch (error) {
        console.error('CSRF validation error:', error);
        return false;
    }
}

// Danh sách các đường dẫn được miễn kiểm tra CSRF
const CSRF_EXEMPT_PATHS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/csrf/token'
];

// Middleware để kiểm tra CSRF token
export function csrfProtection(handler) {
    return async (req, res) => {
        const path = req.url?.split('?')[0]; // Lấy path cơ bản

        // Bỏ qua GET requests vì chúng không sửa đổi dữ liệu
        if (req.method === 'GET') {
            // Tạo token mới cho form
            setCSRFToken(res);
            return handler(req, res);
        }

        // Bỏ qua kiểm tra CSRF cho các đường dẫn trong danh sách miễn trừ
        if (CSRF_EXEMPT_PATHS.includes(path)) {
            // Vẫn đặt CSRF token mới
            setCSRFToken(res);
            return handler(req, res);
        }

        // Kiểm tra token cho các phương thức khác (POST, PUT, DELETE...)
        const token = req.body?.csrfToken || req.headers['x-csrf-token'];

        if (!validateCSRFToken(req, token)) {
            console.warn(`CSRF validation failed for ${path}. Token provided: ${!!token}`);
            return res.status(403).json({ message: 'CSRF token không hợp lệ hoặc đã hết hạn' });
        }

        // Tạo token mới sau khi xác thực thành công
        setCSRFToken(res);
        return handler(req, res);
    };
}

// Middleware cho Next.js API Routes - Phiên bản đơn giản hơn
export function simpleCsrfProtection(handler) {
    return async (req, res) => {
        // Luôn đặt token mới
        setCSRFToken(res);
        return handler(req, res);
    };
} 