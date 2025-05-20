// monolithic-core/pages/api/auth/login.js
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { applyRateLimit } from '../../../lib/middlewares/rateLimit';
import { sanitizeObject } from '../../../lib/sanitize';
import { simpleCsrfProtection, setCSRFToken } from '../../../lib/csrf';
import { passwordStrengthScore } from '../../../lib/passwordValidator';

dotenv.config(); // Để đọc JWT_SECRET từ .env

// Theo dõi các lần đăng nhập thất bại
const loginAttempts = new Map(); // { email: { count, lastAttempt } }

// Ghi log các hoạt động đăng nhập
function logLoginActivity(email, success, ip, userAgent, reason = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    email,
    success,
    ip,
    userAgent,
    reason
  };

  console.log(`[LOGIN] ${timestamp} | ${email} | ${success ? 'SUCCESS' : 'FAILURE'} | IP: ${ip} | ${reason || ''}`);

  // Trong thực tế, bạn nên lưu log vào DB hoặc file
  // await prisma.activityLog.create({ data: logEntry });
}

// Middleware xử lý login
async function loginHandler(req, res) {
  // Áp dụng rate limiting
  try {
    const rateCheckResult = await applyRateLimit(req, res, {
      maxRequests: 5,
      windowMs: 5 * 60 * 1000, // 5 phút
      message: 'Quá nhiều lần đăng nhập thất bại'
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
  const { email, password } = sanitizedBody;

  // Lấy thông tin client
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'unknown';

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Kiểm tra nếu email này đã có quá nhiều lần đăng nhập thất bại
    const attempts = loginAttempts.get(email);
    const now = Date.now();

    if (attempts && attempts.count >= 5) {
      // Kiểm tra thời gian từ lần thất bại gần nhất
      const timeSinceLastAttempt = now - attempts.lastAttempt;
      const lockoutPeriod = 15 * 60 * 1000; // 15 phút

      if (timeSinceLastAttempt < lockoutPeriod) {
        const remainingLockTime = Math.ceil((lockoutPeriod - timeSinceLastAttempt) / 1000 / 60);

        logLoginActivity(email, false, ip, userAgent, `Account locked - too many failed attempts (${attempts.count})`);

        return res.status(429).json({
          message: `Tài khoản tạm thời bị khóa do có quá nhiều lần đăng nhập sai. Vui lòng thử lại sau ${remainingLockTime} phút.`,
          locked: true,
          remainingLockTime
        });
      } else {
        // Reset attempts nếu đã qua thời gian khóa
        loginAttempts.delete(email);
      }
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      // Ghi nhận thất bại
      recordFailedAttempt(email);
      logLoginActivity(email, false, ip, userAgent, 'Invalid email');

      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      // Ghi nhận thất bại
      recordFailedAttempt(email);
      logLoginActivity(email, false, ip, userAgent, 'Invalid password');

      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    // Đánh giá độ mạnh mật khẩu và thông báo nếu cần thiết
    const passwordCheck = passwordStrengthScore(password);
    const weakPasswordWarning = passwordCheck.score < 50
      ? 'Mật khẩu của bạn khá yếu. Hãy cân nhắc đổi mật khẩu mạnh hơn để bảo vệ tài khoản.'
      : null;

    // Tạo JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Không trả về passwordHash
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.passwordHash;

    // Reset số lần thất bại
    loginAttempts.delete(email);

    // Ghi nhận thành công
    logLoginActivity(email, true, ip, userAgent);

    // Đặt CSRF token
    setCSRFToken(res);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
      weakPasswordWarning
    });
  } catch (error) {
    console.error('Login error:', error);

    // Check for database connection errors
    if (error.code === 'P1001' || error.message?.includes('database') || error.message?.includes('connect')) {
      return res.status(503).json({
        message: 'Database connection error. Please try again later.',
        error: 'database_error',
        details: error.message
      });
    }

    // General server error
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('Error disconnecting from database:', e);
    }
  }
}

// Hàm ghi nhận thất bại đăng nhập
function recordFailedAttempt(email) {
  const now = Date.now();
  const currentAttempts = loginAttempts.get(email) || { count: 0, lastAttempt: now };

  currentAttempts.count += 1;
  currentAttempts.lastAttempt = now;

  loginAttempts.set(email, currentAttempts);
}

// Wrap handler với Simplified CSRF protection
export default simpleCsrfProtection(loginHandler);