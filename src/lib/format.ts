/**
 * Format angka ke format Rupiah Indonesia
 * Contoh: 150000 → "Rp150.000"
 * 
 * Juga menerima Prisma Decimal dan string angka.
 */
export function formatRupiah(price: number | { toString(): string } | string): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(price) || 0)
}
