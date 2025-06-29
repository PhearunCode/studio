'use server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramNotification(message: string, chatId?: string): Promise<void> {
  const targetChatId = chatId || TELEGRAM_CHAT_ID;
  
  if (!TELEGRAM_BOT_TOKEN || !targetChatId) {
    const errorMessage = 'Telegram Bot Token or Chat ID not set. Please update your .env file or ensure the customer has a valid chat ID.';
    console.warn(errorMessage);
    // Don't throw for individual customer failures, just for admin config issues.
    if (!chatId) {
      throw new Error(errorMessage);
    }
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      const errorDescription = `Failed to send Telegram notification to ${targetChatId}: ${data.description}`;
      console.error(errorDescription);
      throw new Error(errorDescription);
    } else {
      console.log(`Telegram notification sent successfully to ${targetChatId}.`);
    }
  } catch (error) {
    console.error(`Error sending Telegram notification to ${targetChatId}:`, error);
    throw error;
  }
}
