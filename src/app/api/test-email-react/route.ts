import { NextRequest, NextResponse } from 'next/server';
import { sendOrderReceipt, sendSellerNotification } from '@/lib/email';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email') || 'nizarabdurr@gmail.com';
  const type = req.nextUrl.searchParams.get('type') || 'buyer'; // 'buyer' or 'seller'

  try {
    let result;
    if (type === 'seller') {
      result = await sendSellerNotification({
        to: email,
        orderId: 'TRX-TEST999',
        sellerName: 'LokaBeli Official Store',
        buyerName: 'Nizar',
        items: [
          { name: 'MacBook Pro M3 Max', quantity: 1 },
          { name: 'AirPods Pro 2', quantity: 2 }
        ]
      });
    } else {
      result = await sendOrderReceipt({
        to: email,
        orderId: 'TRX-TEST999',
        buyerName: 'Nizar',
        totalAmount: 'Rp 45.000.000',
        items: [
          { name: 'MacBook Pro M3 Max', quantity: 1, price: 'Rp 40.000.000' },
          { name: 'AirPods Pro 2', quantity: 2, price: 'Rp 5.000.000' }
        ]
      });
    }

    return NextResponse.json({ success: true, message: `Email (${type}) sent to ${email}`, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
