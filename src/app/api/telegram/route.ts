import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
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
                reply_markup: replyMarkup,
            }),
        });
        const data = await response.json();
        console.log('SendMessage response:', data);
        return data;
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
    try {
        await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                callback_query_id: callbackQueryId,
                text: text,
            }),
        });
    } catch (error) {
        console.error('Error answering callback query:', error);
    }
}

export async function POST(req: Request) {
    try {
        const update = await req.json();
        console.log('Received Telegram Update:', JSON.stringify(update, null, 2));

        if (update.message && update.message.text === '/start') {
            const chatId = update.message.chat.id;

            const receiptText = `
*🧾 New Order Received!*

*Order ID:* #12345
*Customer:* John Doe
*Items:*
- 2x Margarita Pizza
- 1x Coke (500ml)
- 1x Garlic Bread

*Total:* $45.00
      
Please accept or reject this order.
`;

            const replyMarkup = {
                inline_keyboard: [
                    [
                        { text: '✅ Accept', callback_data: 'accept_order_12345' },
                        { text: '❌ Reject', callback_data: 'reject_order_12345' },
                    ],
                ],
            };

            await sendMessage(chatId, receiptText, replyMarkup);
        } else if (update.callback_query) {
            const callbackQuery = update.callback_query;
            const chatId = callbackQuery.message.chat.id;
            const data = callbackQuery.data;
            const callbackQueryId = callbackQuery.id;

            console.log(`Action received: ${data} from chat ${chatId}`);

            let responseText = '';
            if (data.startsWith('accept')) {
                responseText = '✅ *Order Accepted!* Processing now.';
            } else if (data.startsWith('reject')) {
                responseText = '❌ *Order Rejected.* Customer will be notified.';
            }

            // Acknowledge the button press to stop loading spinner
            await answerCallbackQuery(callbackQueryId, 'Processing...');

            // Send confirmation message
            if (responseText) {
                await sendMessage(chatId, responseText);
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error handling Telegram webhook:', error);
        return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
