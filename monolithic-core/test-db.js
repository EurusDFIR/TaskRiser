// test-db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
    try {
        // Test a simple query
        const userCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "User";`;
        console.log('Database connection successful');
        console.log('User count:', userCount);
        return true;
    } catch (error) {
        console.error('Database connection error:');
        console.error(error);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

testConnection()
    .then(success => {
        if (!success) {
            console.log('Please check your DATABASE_URL in .env file');
            console.log('Current environment variables:', process.env.DATABASE_URL ? 'DATABASE_URL exists' : 'DATABASE_URL not found');
        }
        process.exit(success ? 0 : 1);
    }); 