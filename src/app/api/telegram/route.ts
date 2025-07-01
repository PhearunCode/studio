import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check for a message from a user and if the text is /start
    if (body.message && body.message.text === '/start') {
      const chatId = body.message.chat.id;
      const welcomeMessage = 'សូមស្វាគម៏មកកាន់កម្ចីជាមូយ​ LendEasy PH';
      
      if (chatId) {
        await sendTelegramNotification(welcomeMessage, String(chatId));
        return NextResponse.json({ ok: true, message: 'Welcome message sent.' });
      }
    }

    // Acknowledge other updates from Telegram without taking action
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('Error in Telegram webhook:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
