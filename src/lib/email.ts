import { Resend } from 'resend';
import OrderReceiptEmail from '@/components/emails/OrderReceiptEmail';
import NewOrderAlertEmail from '@/components/emails/NewOrderAlertEmail';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Resend (bisa null jika API key tidak diset)
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Ganti ini dengan email yang sudah bos verifikasi di Resend
const SENDER_EMAIL = 'LokaBeli <noreply@lokabeli.my.id>';

export const getUserEmailByProfileId = async (profileId: string): Promise<string | null> => {
  try {
    const { data: profile } = await supabaseAdmin.from('Profile').select('userId').eq('id', profileId).single();
    if (!profile || !profile.userId) return null;

    const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(profile.userId);
    if (error || !user.user) return null;
    
    return user.user.email || null;
  } catch (error) {
    console.error('Error fetching user email:', error);
    return null;
  }
};

export const sendOrderReceipt = async ({
  to,
  orderId,
  buyerName,
  totalAmount,
  items,
}: {
  to: string;
  orderId: string;
  buyerName: string;
  totalAmount: string;
  items: { name: string; quantity: number; price: string }[];
}) => {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY tidak ditemukan. Simulasi pengiriman resi ke:', to);
    return;
  }

  try {
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [to],
      subject: `Kwitansi Pembayaran LokaBeli #${orderId}`,
      react: OrderReceiptEmail({ orderId, buyerName, totalAmount, items }),
    });
    console.log('✅ Resi email berhasil dikirim ke:', to, data);
    return data;
  } catch (error) {
    console.error('❌ Gagal mengirim resi email:', error);
  }
};

export const sendSellerNotification = async ({
  to,
  orderId,
  sellerName,
  buyerName,
  items,
}: {
  to: string;
  orderId: string;
  sellerName: string;
  buyerName: string;
  items: { name: string; quantity: number }[];
}) => {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY tidak ditemukan. Simulasi notif seller ke:', to);
    return;
  }

  try {
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [to],
      subject: `Pesanan Baru Masuk! 🎉 #${orderId}`,
      react: NewOrderAlertEmail({ orderId, sellerName, buyerName, items }),
    });
    console.log('✅ Notif email berhasil dikirim ke seller:', to, data);
    return data;
  } catch (error) {
    console.error('❌ Gagal mengirim notif email seller:', error);
  }
};
