import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function sendMessage(chatId: number, text: string) {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });
    const data = await response.json();
    console.log('SendMessage response:', data);
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

export async function POST(req: Request) {
  try {
    const update = await req.json();
    console.log('Received Telegram Update:', JSON.stringify(update, null, 2));

    if (update.message && update.message.text === '/start') {
      const chatId = update.message.chat.id;
      
      const chatIdMessage = `
🎉 *Welcome to Order Notifications!*

📋 *Your Chat ID:* \`${chatId}\`

*Setup Instructions:*

1️⃣ Open your Admin Panel
2️⃣ Navigate to *Ordering & Billing* section
3️⃣ Paste this Chat ID in the *Telegram Chat ID* field
4️⃣ Click *Save Settings*

✅ Once configured, you'll receive order notifications here!
      `.trim();

      await sendMessage(chatId, chatIdMessage);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}