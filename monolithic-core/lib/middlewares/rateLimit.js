// Middleware để giới hạn số lần request từ một IP trong một khoảng thời gian
// Sử dụng memory store đơn giản, trong thực tế nên dùng Redis/Memcached để scale

const ipRequestMap = new Map();

// Cấu trúc: { [ip]: { count: number, resetTime: Date } }

/**
 * Rate limiting middleware
 * @param {number} maxRequests - Số lượng request tối đa cho phép
 * @param {number} windowMs - Cửa sổ thời gian (ms) để reset rate limit
 * @param {string} message - Thông báo lỗi khi rate limit bị vượt quá
 */
export default function rateLimit(maxRequests = 5, windowMs = 60 * 1000, message = 'Quá nhiều yêu cầu, vui lòng thử lại sau') {
    return (req, res, next) => {
        // Lấy IP của client
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // Lấy thời gian hiện tại
        const now = Date.now();

        // Nếu IP này chưa có trong map, hoặc đã quá thời gian reset
        if (!ipRequestMap.has(ip) || ipRequestMap.get(ip).resetTime < now) {
            ipRequestMap.set(ip, {
                count: 1,
                resetTime: now + windowMs
            });

            // Forward the request
            return next(req, res);
        }

        // IP đã tồn tại và chưa quá thời gian reset
        const requestInfo = ipRequestMap.get(ip);

        // Kiểm tra nếu đã vượt quá giới hạn
        if (requestInfo.count >= maxRequests) {
            // Tính thời gian còn lại trước khi reset (giây)
            const remainingTime = Math.ceil((requestInfo.resetTime - now) / 1000);

            // Set response headers
            res.setHeader('Retry-After', remainingTime);
            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', 0);
            res.setHeader('X-RateLimit-Reset', Math.ceil(requestInfo.resetTime / 1000));

            // Log blocked attempt
            console.warn(`Rate limit exceeded for IP ${ip}`);

            // Trả về lỗi 429 (Too Many Requests)
            return res.status(429).json({
                status: 'error',
                message: `${message}. Vui lòng thử lại sau ${remainingTime} giây.`,
                remainingTime
            });
        }

        // Tăng số lượng request
        requestInfo.count++;
        ipRequestMap.set(ip, requestInfo);

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', maxRequests - requestInfo.count);
        res.setHeader('X-RateLimit-Reset', Math.ceil(requestInfo.resetTime / 1000));

        // Forward the request
        return next(req, res);
    };
}

// Middleware dành riêng cho trang login - giới hạn chặt chẽ hơn
export function loginRateLimit() {
    return (req, res, next) => {
        // Rate limit chặt chẽ hơn cho login: 5 lần/phút
        return rateLimit(5, 60 * 1000, 'Quá nhiều lần đăng nhập thất bại')(req, res, next);
    };
}

// Hàm tích hợp với Next.js API route
export function applyRateLimit(req, res, options = {}) {
    return new Promise((resolve, reject) => {
        const { maxRequests = 5, windowMs = 60 * 1000, message = 'Quá nhiều yêu cầu' } = options;

        // Khởi tạo middleware
        const limiter = rateLimit(maxRequests, windowMs, message);

        // Tạo hàm next để chuyển tiếp
        const next = () => {
            resolve(true);
        };

        // Chạy middleware
        limiter(req, res, next);
    });
} 