import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface OrderReceiptEmailProps {
  orderId: string;
  buyerName: string;
  totalAmount: string;
  items: { name: string; quantity: number; price: string }[];
}

export const OrderReceiptEmail = ({
  orderId = 'TRX-12345678',
  buyerName = 'Pelanggan Setia',
  totalAmount = 'Rp 100.000',
  items = [{ name: 'Produk Contoh', quantity: 1, price: 'Rp 100.000' }],
}: OrderReceiptEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Kwitansi Pembayaran LokaBeli #{orderId}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>LokaBeli</Heading>
          <Text style={paragraph}>Halo {buyerName},</Text>
          <Text style={paragraph}>
            Terima kasih telah berbelanja di LokaBeli! Pembayaran kamu untuk pesanan <strong>#{orderId}</strong> telah berhasil kami terima.
          </Text>
          <Hr style={hr} />
          
          <Section>
            <Text style={subheading}>Rincian Pesanan:</Text>
            {items.map((item, index) => (
              <Text key={index} style={itemText}>
                {item.quantity}x {item.name} - {item.price}
              </Text>
            ))}
          </Section>
          
          <Hr style={hr} />
          <Section>
            <Text style={totalText}>Total Pembayaran: {totalAmount}</Text>
          </Section>

          <Section style={btnContainer}>
            <Link style={button} href={`https://lokabeli.my.id/buyer/orders`}>
              Cek Status Pesanan
            </Link>
          </Section>
          
          <Text style={footer}>
            Jika ada pertanyaan, silakan hubungi penjual via fitur chat di LokaBeli.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  maxWidth: '580px',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: 'bold',
  color: '#7C3AED',
  padding: '0 40px',
};

const subheading = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333',
  padding: '0 40px',
  marginBottom: '10px',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#525f7f',
  padding: '0 40px',
};

const itemText = {
  fontSize: '14px',
  color: '#525f7f',
  padding: '0 40px',
  margin: '4px 0',
};

const totalText = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333',
  padding: '0 40px',
};

const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '24px',
};

const button = {
  backgroundColor: '#7C3AED',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  marginTop: '32px',
};

export default OrderReceiptEmail;
