import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const topUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { total_exp: 'desc' },
      select: {
        id: true,
        username: true,
        total_exp: true,
      },
    });
    return NextResponse.json(topUsers);
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
