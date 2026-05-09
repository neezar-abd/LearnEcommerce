import { snap } from '@/lib/midtrans'

export default function TestPage() {
  return <div>{typeof snap.createTransaction}</div>
}
