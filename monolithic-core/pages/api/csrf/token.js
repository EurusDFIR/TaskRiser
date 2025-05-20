import { setCSRFToken } from '../../../lib/csrf';

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Tạo và thiết lập CSRF token mới
    const token = setCSRFToken(res);

    // Trả về token cho client
    res.status(200).json({ csrfToken: token });
} 