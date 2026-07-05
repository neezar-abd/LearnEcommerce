import 'dotenv/config';
import { Resend } from 'resend';
import * as React from 'react';
import OrderReceiptEmail from './src/components/emails/OrderReceiptEmail';
import NewOrderAlertEmail from './src/components/emails/NewOrderAlertEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
const TARGET = 'nizarabdurr@gmail.com';

async function main() {
  console.log("Menembakkan email dengan desain PRO MAX...");

  try {
    await resend.emails.send({
      from: 'LokaBeli <noreply@lokabeli.my.id>',
      to: [TARGET],
      subject: 'Desain Kwitansi PRO MAX 🔥',
      react: React.createElement(OrderReceiptEmail, {
        orderId: 'TRX-PROMAX123',
        buyerName: 'Nizar',
        totalAmount: 'Rp 45.000.000',
        items: [
          { name: 'MacBook Pro M3 Max', quantity: 1, price: 'Rp 40.000.000' },
          { name: 'AirPods Pro 2', quantity: 2, price: 'Rp 5.000.000' }
        ]
      })
    });
    console.log("✅ Kwitansi Terkirim!");

    await resend.emails.send({
      from: 'LokaBeli <noreply@lokabeli.my.id>',
      to: [TARGET],
      subject: 'Desain Alert Seller PRO MAX 🔥',
      react: React.createElement(NewOrderAlertEmail, {
        orderId: 'TRX-PROMAX123',
        sellerName: 'LokaBeli Official Store',
        buyerName: 'Nizar',
        items: [
          { name: 'MacBook Pro M3 Max', quantity: 1 },
          { name: 'AirPods Pro 2', quantity: 2 }
        ]
      })
    });
    console.log("✅ Alert Terkirim!");

  } catch (error) {
    console.error("Gagal:", error);
  }
}

main();
