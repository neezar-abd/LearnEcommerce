const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.profile.findFirst();
  if (!profile) {
    console.log("Tidak ada user di database!");
    return;
  }

  const notif = await prisma.notification.create({
    data: {
      profileId: profile.id,
      type: 'SYSTEM',
      title: 'Tembakan Kedua Masuk! 🎯',
      message: 'BOOM! Loncengnya baru saja melompat kan? Ini bukti kalau Supabase Realtime bekerja super cepat, bahkan lebih cepat dari kilat! Pesanan masuk akan terasa sangat responsif sekarang.',
      link: '/'
    }
  });

  console.log("Berhasil menembak notifikasi kedua ke user:", profile.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
