'use server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramNotification(
  message?: string,
  chatId?: string,
  photoDataUri?: string
): Promise<void> {
  const targetChatId = chatId || TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !targetChatId) {
    const errorMessage =
      'Telegram Bot Token or Chat ID not set. Please update your .env file or ensure the customer has a valid chat ID.';
    console.warn(errorMessage);
    if (!chatId) {
      throw new Error(errorMessage);
    }
    return;
  }

  if (photoDataUri) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

    const base64Data = photoDataUri.split(',')[1];
    if (!base64Data) {
        throw new Error("Invalid photo data URI format.");
    }
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const mimeType = photoDataUri.match(/data:(.*);base64/)?.[1] || 'image/jpeg';
    const fileExtension = mimeType.split('/')[1] || 'jpg';
    const fileName = `photo.${fileExtension}`;

    const formData = new FormData();
    formData.append('chat_id', targetChatId);
    formData.append('photo', new Blob([imageBuffer], { type: mimeType }), fileName);

    if (message) {
      formData.append('caption', message);
      // Markdown is not supported for photo captions via multipart/form-data
      // formData.append('parse_mode', 'Markdown');
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!data.ok) {
        const errorDescription = `Failed to send Telegram photo to ${targetChatId}: ${data.description}`;
        console.error(errorDescription);
        throw new Error(errorDescription);
      } else {
        console.log(`Telegram photo sent successfully to ${targetChatId}.`);
      }
    } catch (error) {
      console.error(`Error sending Telegram photo to ${targetChatId}:`, error);
      throw error;
    }
  } else if (message) {
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
  } else {
      console.warn('sendTelegramNotification called with no message or photo.');
  }
}
