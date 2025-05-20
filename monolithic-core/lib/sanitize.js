/**
 * Làm sạch dữ liệu đầu vào để ngăn chặn XSS
 */

/**
 * Loại bỏ HTML tags từ một chuỗi
 * @param {string} input - Chuỗi đầu vào
 * @returns {string} - Chuỗi đã làm sạch
 */
export function stripHtmlTags(input) {
    if (!input || typeof input !== 'string') {
        return '';
    }
    return input.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML đặc biệt để hiển thị dưới dạng text
 * @param {string} input - Chuỗi đầu vào
 * @returns {string} - Chuỗi đã được escape
 */
export function escapeHtml(input) {
    if (!input || typeof input !== 'string') {
        return '';
    }

    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    return input.replace(/[&<>"'`=\/]/g, char => htmlEscapes[char]);
}

/**
 * Giới hạn độ dài của string
 * @param {string} input - Chuỗi đầu vào
 * @param {number} maxLength - Độ dài tối đa
 * @returns {string} - Chuỗi đã giới hạn độ dài
 */
export function truncate(input, maxLength = 100) {
    if (!input || typeof input !== 'string') {
        return '';
    }

    if (input.length <= maxLength) {
        return input;
    }

    return input.slice(0, maxLength) + '...';
}

/**
 * Làm sạch input cho username (alphanumeric + một số ký tự đặc biệt giới hạn)
 * @param {string} username - Username đầu vào
 * @returns {string} - Username đã làm sạch
 */
export function sanitizeUsername(username) {
    if (!username || typeof username !== 'string') {
        return '';
    }

    // Chỉ cho phép chữ cái, số, và một số ký tự đặc biệt an toàn
    return username.replace(/[^a-zA-Z0-9_\-\.]/g, '')
        .substring(0, 30); // Giới hạn độ dài 30 ký tự
}

/**
 * Làm sạch một đối tượng input
 * @param {Object} data - Đối tượng cần làm sạch
 * @returns {Object} - Đối tượng đã làm sạch
 */
export function sanitizeObject(data) {
    if (!data || typeof data !== 'object') {
        return {};
    }

    const sanitized = {};

    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            sanitized[key] = stripHtmlTags(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item =>
                typeof item === 'string' ? stripHtmlTags(item) : item
            );
        } else if (value && typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

/**
 * Làm sạch dữ liệu đầu vào cho API endpoint
 * @param {Object} req - Request object
 * @returns {Object} - Request object đã làm sạch
 */
export function sanitizeRequest(req) {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    if (req.query) {
        req.query = sanitizeObject(req.query);
    }

    return req;
} 