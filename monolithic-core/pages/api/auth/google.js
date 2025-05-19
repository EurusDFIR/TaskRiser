import { OAuth2Client } from 'google-auth-library';
import prisma from '../../../lib/prisma';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    try {
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user exists
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { providerId: googleId }
                ]
            }
        });

        if (!user) {
            // Create new user if doesn't exist
            user = await prisma.user.create({
                data: {
                    email,
                    username: name,
                    provider: 'google',
                    providerId: googleId,
                    avatar: picture,
                }
            });
        } else if (user.provider !== 'google') {
            // Update existing user if they used local auth before
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    provider: 'google',
                    providerId: googleId,
                    avatar: picture,
                }
            });
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            { userId: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Remove sensitive data
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.passwordHash;

        res.status(200).json({
            message: 'Login successful',
            token: jwtToken,
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ message: 'Invalid token' });
    } finally {
        await prisma.$disconnect();
    }
} 