import { forgotPassword } from './actions'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const error = params?.error as string | undefined
  const success = params?.success

  return (
    <div className="min-h-screen bg-[#7C3AED] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white px-4 md:px-12 py-4 flex items-center shadow-sm">
        <a href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 bg-[#7C3AED] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">U</span>
          </div>
          <span className="font-bold text-2xl tracking-tight text-[#7C3AED]">LokaBeli</span>
          <span className="text-2xl font-medium text-gray-800 ml-2">Lupa Password</span>
        </a>
      </header>

      {/* Main */}
      <div className="flex-1 flex max-w-[1040px] w-full mx-auto items-center justify-center md:justify-between px-4 py-8">
        
        {/* Left Branding */}
        <div className="hidden md:flex flex-col text-white max-w-[500px]">
          <div className="w-20 h-20 shadow-lg bg-white rounded-full flex items-center justify-center mb-6">
            <span className="text-[#7C3AED] font-bold text-5xl">U</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 leading-tight">Reset<br/>Password Kamu</h1>
          <p className="text-lg text-white/90">Masukkan email yang terdaftar, kami akan kirim link untuk reset password.</p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-[400px] bg-white rounded p-8 shadow-2xl">
          <h2 className="text-xl font-medium text-gray-800 mb-2">Lupa Password?</h2>
          <p className="text-sm text-gray-500 mb-6">Link reset password akan dikirim ke email kamu.</p>

          {error && (
            <div className="mb-4 rounded-sm bg-[#FFF5F5] border border-[#FFC2C2] p-3">
              <p className="text-sm text-[#7C3AED] text-center">{error}</p>
            </div>
          )}

          {success ? (
            <div className="rounded-sm bg-green-50 border border-green-200 p-4 text-center">
              <div className="text-3xl mb-2">📬</div>
              <h3 className="font-semibold text-green-700 mb-1">Email Terkirim!</h3>
              <p className="text-sm text-green-600">
                Cek inbox kamu dan klik link yang kami kirim untuk reset password.
                <br/>
                <span className="text-xs text-gray-400 mt-1 block">Cek folder spam jika tidak masuk inbox.</span>
              </p>
              <a
                href="/login"
                className="mt-4 inline-block text-[#7C3AED] text-sm font-medium hover:underline"
              >
                ← Kembali ke Login
              </a>
            </div>
          ) : (
            <form className="space-y-5">
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-sm border border-gray-300 px-3 py-3 text-sm placeholder-gray-400 focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
                  placeholder="Masukkan email kamu"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  formAction={forgotPassword}
                  className="w-full bg-[#7C3AED] py-3 px-4 text-sm font-medium text-white hover:bg-[#6D28D9] focus:outline-none transition-colors rounded-sm uppercase tracking-wider"
                >
                  Kirim Link Reset
                </button>

                <a
                  href="/login"
                  className="text-center text-sm text-gray-500 hover:text-[#7C3AED] transition-colors"
                >
                  ← Kembali ke Login
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
