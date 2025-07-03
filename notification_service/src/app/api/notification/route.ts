import { NextResponse } from 'next/server';

// Dummy notification sender (replace with real logic: email, push, etc.)
async function sendNotification({ userId, message }: { userId: string; message: string }) {
  // TODO: Gửi email, push, hoặc lưu vào DB notification
  console.log(`Send notification to user ${userId}: ${message}`);
  return true;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, message } = body;
  if (!userId || !message) {
    return NextResponse.json({ message: 'userId and message are required' }, { status: 400 });
  }
  const result = await sendNotification({ userId, message });
  if (result) {
    return NextResponse.json({ message: 'Notification sent!' });
  } else {
    return NextResponse.json({ message: 'Failed to send notification' }, { status: 500 });
  }
}
