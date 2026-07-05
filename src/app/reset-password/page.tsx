import ResetPasswordClient from './ResetPasswordClient'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const error = params?.error as string | undefined

  return (
    <div className="min-h-screen bg-[#7C3AED] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white px-4 md:px-12 py-4 flex items-center shadow-sm">
        <a href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 bg-[#7C3AED] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">U</span>
          </div>
          <span className="font-bold text-2xl tracking-tight text-[#7C3AED]">LokaBeli</span>
          <span className="text-2xl font-medium text-gray-800 ml-2">Reset Password</span>
        </a>
      </header>

      {/* Main */}
      <div className="flex-1 flex max-w-[1040px] w-full mx-auto items-center justify-center md:justify-between px-4 py-8">

        {/* Left Branding */}
        <div className="hidden md:flex flex-col text-white max-w-[500px]">
          <div className="w-20 h-20 shadow-lg bg-white rounded-full flex items-center justify-center mb-6">
            <span className="text-[#7C3AED] font-bold text-5xl">U</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 leading-tight">Buat Password<br/>Baru Kamu</h1>
          <p className="text-lg text-white/90">Masukkan password baru yang kuat dan mudah kamu ingat.</p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-[400px] bg-white rounded p-8 shadow-2xl">
          <h2 className="text-xl font-medium text-gray-800 mb-2">Buat Password Baru</h2>
          <p className="text-sm text-gray-500 mb-6">Password minimal 8 karakter.</p>

          {error && (
            <div className="mb-4 rounded-sm bg-[#FFF5F5] border border-[#FFC2C2] p-3">
              <p className="text-sm text-[#7C3AED] text-center">{error}</p>
            </div>
          )}

          <ResetPasswordClient />

          <p className="text-center text-xs text-gray-400 mt-4">
            Ingat password lama?{' '}
            <a href="/login" className="text-[#7C3AED] hover:underline font-medium">
              Login di sini
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
