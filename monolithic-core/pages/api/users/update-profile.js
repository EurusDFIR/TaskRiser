import prisma from '../../../lib/prisma';
import withAuth from '../../../lib/middlewares/withAuth';
import bcrypt from 'bcryptjs';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
    api: {
        bodyParser: false,
    },
};

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { userId } = req.user;

        // Parse form data
        const form = formidable({
            multiples: true,
            keepExtensions: true
        });

        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve([fields, files]);
            });
        });

        // Log để debug
        console.log('Fields received:', fields);
        console.log('Files received:', files);

        // Ensure username is a string (not an array)
        const username = fields.username ? String(fields.username) : null;
        const avatarUrl = fields.avatarUrl ? String(fields.avatarUrl) : null;
        const avatarFile = files.avatar ? files.avatar : null;

        // Check if username is taken
        if (username) {
            // Make sure userId is a string for the comparison
            const userIdStr = String(userId);

            const existingUser = await prisma.user.findFirst({
                where: {
                    username: username,
                    id: { not: userIdStr },
                },
            });

            if (existingUser) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
        }

        // Handle avatar upload
        let finalAvatarUrl = avatarUrl;
        if (avatarFile && avatarFile.filepath && fs.existsSync(avatarFile.filepath)) {
            try {
                const uploadDir = path.join(process.cwd(), 'public', 'uploads');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                // Lấy extension từ originalFilename hoặc từ mimetype nếu không có
                let fileExt = '';
                if (avatarFile.originalFilename) {
                    fileExt = path.extname(avatarFile.originalFilename);
                } else if (avatarFile.mimetype) {
                    // Lấy extension từ mimetype (e.g., image/jpeg -> .jpeg)
                    const mime = avatarFile.mimetype.split('/');
                    if (mime.length > 1) {
                        fileExt = `.${mime[1]}`;
                    }
                }

                const fileName = `${uuidv4()}${fileExt}`;
                const filePath = path.join(uploadDir, fileName);

                // Copy file to uploads directory
                fs.copyFileSync(avatarFile.filepath, filePath);
                finalAvatarUrl = `/uploads/${fileName}`;
                console.log('File uploaded successfully to', filePath);
            } catch (error) {
                console.error('Error uploading file:', error);
                // Không throw lỗi, chỉ log để form vẫn có thể tiếp tục với username
            }
        } else if (avatarFile) {
            console.warn('Avatar file không hợp lệ hoặc không tìm thấy đường dẫn tạm:', avatarFile);
        }

        // Update user - ensure proper types again
        const updatedUser = await prisma.user.update({
            where: { id: String(userId) },
            data: {
                ...(username && { username }),
                ...(finalAvatarUrl && { avatar: finalAvatarUrl }),
            },
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                totalExp: true,
            },
        });

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            message: 'Failed to update profile',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        await prisma.$disconnect();
    }
}

export default withAuth(handler); 