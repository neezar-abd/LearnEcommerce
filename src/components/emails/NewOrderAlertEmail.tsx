import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface NewOrderAlertEmailProps {
  orderId: string;
  sellerName: string;
  buyerName: string;
  items: { name: string; quantity: number }[];
}

export const NewOrderAlertEmail = ({
  orderId = 'TRX-12345678',
  sellerName = 'Toko Anda',
  buyerName = 'Pelanggan Baru',
  items = [{ name: 'Produk Contoh', quantity: 1 }],
}: NewOrderAlertEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Pesanan Baru Masuk! #{orderId}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>LokaBeli Seller Alert</Heading>
          <Text style={paragraph}>Halo {sellerName},</Text>
          <Text style={paragraph}>
            Kabar gembira! Toko Anda baru saja mendapatkan pesanan baru dari <strong>{buyerName}</strong>.
          </Text>
          <Hr style={hr} />
          
          <Section>
            <Text style={subheading}>Pesanan yang harus disiapkan:</Text>
            {items.map((item, index) => (
              <Text key={index} style={itemText}>
                {item.quantity}x {item.name}
              </Text>
            ))}
          </Section>
          
          <Hr style={hr} />

          <Section style={btnContainer}>
            <Link style={button} href={`https://lokabeli.my.id/seller/orders`}>
              Proses Pesanan Sekarang
            </Link>
          </Section>
          
          <Text style={footer}>
            Harap segera memproses pesanan ini agar pelanggan puas dengan pelayanan toko Anda.
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
  fontSize: '22px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: 'bold',
  color: '#22c55e', // Green for positive alert
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

const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '24px',
};

const button = {
  backgroundColor: '#22c55e',
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

export default NewOrderAlertEmail;
