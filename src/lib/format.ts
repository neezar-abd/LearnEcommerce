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

/**
 * Format tanggal ke format lokal Indonesia
 * Contoh: "12 Januari 2024"
 */
export function formatDate(dateString: Date | string | null | undefined): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}
