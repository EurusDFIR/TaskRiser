// monolithic-core/pages/api/auth/register.js
import prisma from '../../../lib/prisma'; // Sử dụng Prisma client đã khởi tạo
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, email, password } = req.body;

  // Validate cơ bản
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
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
      },
      select: { // Chỉ chọn các trường cần trả về, không bao gồm passwordHash
        id: true,
        username: true,
        email: true,
        totalExp: true,
      }
    });

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