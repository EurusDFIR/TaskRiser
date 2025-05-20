// monolithic-core/pages/api/auth/register.js
import prisma from '../../../lib/prisma'; // Sử dụng Prisma client đã khởi tạo
import bcrypt from 'bcryptjs';
import { validatePasswordStrength } from '../../../lib/passwordValidator';
import { sanitizeObject, sanitizeUsername } from '../../../lib/sanitize';
import { simpleCsrfProtection, setCSRFToken } from '../../../lib/csrf';
import { applyRateLimit } from '../../../lib/middlewares/rateLimit';

async function registerHandler(req, res) {
  // Áp dụng rate limiting
  try {
    const rateCheckResult = await applyRateLimit(req, res, {
      maxRequests: 3,
      windowMs: 60 * 60 * 1000, // 1 giờ
      message: 'Quá nhiều tài khoản đăng ký từ một IP'
    });

    if (!rateCheckResult) {
      // Nếu rateLimit đã xử lý response thì return
      return;
    }
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Tiếp tục xử lý nếu rate limiter gặp lỗi
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Làm sạch input để chống XSS
  const sanitizedBody = sanitizeObject(req.body);
  let { username, email, password } = sanitizedBody;

  // Làm sạch username thêm một lần nữa
  username = sanitizeUsername(username);

  // Validate cơ bản
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  // Kiểm tra email hợp lệ
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Kiểm tra độ mạnh mật khẩu
  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.isStrong) {
    return res.status(400).json({
      message: 'Password does not meet security requirements',
      errors: passwordCheck.errors
    });
  }

  try {
    // Kiểm tra user hoặc email đã tồn tại chưa bằng Prisma
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email },
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Lưu user vào database bằng Prisma
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash, // Lưu password đã hash
        provider: 'local', // Xác định đăng ký thủ công
      },
      select: { // Chỉ chọn các trường cần trả về, không bao gồm passwordHash
        id: true,
        username: true,
        email: true,
        totalExp: true,
      }
    });

    // Log hoạt động
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`[REGISTER] ${new Date().toISOString()} | ${email} | SUCCESS | IP: ${ip}`);

    // Đặt CSRF token
    setCSRFToken(res);

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Registration error:', error);
    // Xử lý lỗi cụ thể từ Prisma nếu cần (ví dụ: lỗi unique constraint)
    if (error.code === 'P2002') { // Mã lỗi của Prisma cho unique constraint violation
      return res.status(409).json({ message: 'Username or email already exists (Prisma error).' });
    }
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect(); // Đóng kết nối Prisma (tùy chọn, Prisma quản lý kết nối khá tốt)
  }
}

// Wrap handler với Simplified CSRF protection
export default simpleCsrfProtection(registerHandler);