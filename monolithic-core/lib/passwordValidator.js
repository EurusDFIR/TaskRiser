// Các tiêu chí độ mạnh mật khẩu
const COMMON_PASSWORDS = [
    '123456', 'password', '12345678', 'qwerty', '123456789', '12345', '1234',
    '111111', '1234567', 'dragon', '123123', 'baseball', 'abc123', 'football',
    'monkey', 'letmein', '696969', 'shadow', 'master', '666666', 'qwertyuiop',
    '123321', 'mustang', '1234567890', 'admin', 'welcome', 'azerty'
];

/**
 * Kiểm tra độ mạnh của mật khẩu
 * @param {string} password - Mật khẩu cần kiểm tra
 * @returns {object} - Kết quả kiểm tra gồm isStrong và các lỗi
 */
export function validatePasswordStrength(password) {
    const result = {
        isStrong: true,
        errors: []
    };

    // Kiểm tra độ dài tối thiểu
    if (!password || password.length < 8) {
        result.errors.push('Mật khẩu phải có ít nhất 8 ký tự');
        result.isStrong = false;
    }

    // Kiểm tra có chữ hoa
    if (!/[A-Z]/.test(password)) {
        result.errors.push('Mật khẩu phải chứa ít nhất một chữ cái viết hoa');
        result.isStrong = false;
    }

    // Kiểm tra có chữ thường
    if (!/[a-z]/.test(password)) {
        result.errors.push('Mật khẩu phải chứa ít nhất một chữ cái viết thường');
        result.isStrong = false;
    }

    // Kiểm tra có số
    if (!/\d/.test(password)) {
        result.errors.push('Mật khẩu phải chứa ít nhất một chữ số');
        result.isStrong = false;
    }

    // Kiểm tra có ký tự đặc biệt
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        result.errors.push('Mật khẩu phải chứa ít nhất một ký tự đặc biệt (!@#$%^&*...)');
        result.isStrong = false;
    }

    // Kiểm tra nếu là mật khẩu phổ biến
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
        result.errors.push('Mật khẩu này quá phổ biến và dễ đoán');
        result.isStrong = false;
    }

    // Kiểm tra chuỗi liên tiếp
    if (/01234|12345|23456|34567|45678|56789|98765|87654|76543|65432|54321|43210/.test(password)) {
        result.errors.push('Mật khẩu không nên chứa chuỗi số liên tiếp');
        result.isStrong = false;
    }

    return result;
}

/**
 * Đánh giá tổng quan độ mạnh của mật khẩu từ 0-100
 * @param {string} password - Mật khẩu cần đánh giá
 * @returns {object} - Điểm và mức độ mạnh
 */
export function passwordStrengthScore(password) {
    if (!password) return { score: 0, strength: 'Rất yếu' };

    let score = 0;

    // Cộng điểm theo độ dài
    score += Math.min(password.length * 4, 40);

    // Cộng điểm cho sự đa dạng ký tự
    if (/[A-Z]/.test(password)) score += 10;
    if (/[a-z]/.test(password)) score += 10;
    if (/\d/.test(password)) score += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;

    // Trừ điểm nếu chỉ có một loại ký tự
    if (/^[A-Z]+$/.test(password) || /^[a-z]+$/.test(password) || /^\d+$/.test(password)) {
        score -= 20;
    }

    // Trừ điểm cho mật khẩu phổ biến
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
        score -= 30;
    }

    // Đảm bảo điểm nằm trong khoảng 0-100
    score = Math.max(0, Math.min(score, 100));

    // Xác định mức độ mạnh
    let strength;
    if (score < 30) strength = 'Rất yếu';
    else if (score < 50) strength = 'Yếu';
    else if (score < 70) strength = 'Trung bình';
    else if (score < 90) strength = 'Mạnh';
    else strength = 'Rất mạnh';

    return { score, strength };
} 