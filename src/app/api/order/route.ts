import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase-client';

const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function sendTelegramMessage(chatId: string, text: string) {
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
        return data;
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { restaurant_id, receipt, total_amount } = body;
console.log('body order:',body);
        if (!restaurant_id || !receipt || !total_amount) {
            return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = getServiceRoleClient();

        // 1. Fetch restaurant to get telegram_chat_id and current max order number
        const { data: restaurant, error: restError } = await supabase
            .from('restaurants')
            .select('telegram_chat_id, id')
            .eq('id', restaurant_id)
            .single();
console.log('restaurant order:',restaurant);
        if (restError || !restaurant) {
            return NextResponse.json({ ok: false, error: 'Restaurant not found' }, { status: 404 });
        }

        // 2. Generate new order number
        // We get the max order_number for this restaurant and increment by 1
        const { data: maxOrder, error: maxOrderError } = await supabase
            .from('orders')
            .select('order_number')
            .eq('restaurant_id', restaurant_id)
            .order('order_number', { ascending: false })
            .limit(1)
            .single();

        let newOrderNumber = 1;
        if (maxOrder && maxOrder.order_number) {
            newOrderNumber = maxOrder.order_number + 1;
        }

        console.log('newOrderNumber order:',newOrderNumber);

        // 3. Create Order in Database
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                restaurant_id,
                receipt,
                total_amount,
                order_number: newOrderNumber
            })
            .select()
            .single();

            console.log('order order:',order);

        if (orderError) {
            console.error('Error creating order:', orderError);
            return NextResponse.json({ ok: false, error: 'Failed to create order' }, { status: 500 });
        }

        // 4. Send Telegram Notification (Disabled for now)
        let telegramSent = false;
        if (restaurant.telegram_chat_id) {
          const finalReceipt = `*Order #${newOrderNumber}*\n\n${receipt}`;
          await sendTelegramMessage(restaurant.telegram_chat_id, finalReceipt);
          telegramSent = true;
        }

        return NextResponse.json({
            ok: true,
            orderId: order.id,
            orderNumber: newOrderNumber,
            telegramSent 
        });

    } catch (error) {
        console.error('Error processing order:', error);
        return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
