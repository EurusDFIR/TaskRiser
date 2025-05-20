import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import prisma from '../../../lib/prisma';

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.avatar = user.avatar;
                token.totalExp = user.totalExp;
            }
            return token;
        },
        async session({ session, token }) {
            try {
                // Get user from database
                const user = await prisma.user.findUnique({
                    where: { email: session.user.email },
                });

                if (user) {
                    session.user.id = user.id;
                    session.user.username = user.username;
                    session.user.avatar = user.avatar;
                    session.user.totalExp = user.totalExp;
                }

                return session;
            } catch (error) {
                console.error('Session error:', error);
                return session;
            }
        },
        async signIn({ user, account, profile }) {
            try {
                // Check if user exists
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email },
                });

                if (!existingUser) {
                    // Create new user if doesn't exist
                    await prisma.user.create({
                        data: {
                            email: user.email,
                            username: user.name || user.email.split('@')[0],
                            avatar: user.image,
                        },
                    });
                }

                return true;
            } catch (error) {
                console.error('Sign in error:', error);
                return false;
            }
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET, debug: false,
}); 