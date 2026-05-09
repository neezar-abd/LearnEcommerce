import { login, signup } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="min-h-screen bg-[#EE4D2D] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white px-4 md:px-12 py-4 flex items-center shadow-sm">
        <a href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 bg-[#EE4D2D] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">U</span>
          </div>
          <span className="font-bold text-2xl tracking-tight text-[#EE4D2D]">Uchinaga</span>
          <span className="text-2xl font-medium text-gray-800 ml-2">Log in</span>
        </a>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex max-w-[1040px] w-full mx-auto items-center justify-center md:justify-between px-4 py-8">
        
        {/* Left Branding (Hidden on Mobile) */}
        <div className="hidden md:flex flex-col text-white max-w-[500px]">
          <div className="w-20 h-20 shadow-lg bg-white rounded-full flex items-center justify-center mb-6">
            <span className="text-[#EE4D2D] font-bold text-5xl">U</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 leading-tight">Belanja Mudah,<br/>Aman, dan Cepat</h1>
          <p className="text-lg text-white/90">Bergabung dengan jutaan pengguna lainnya di UchinagaStore hari ini. Jual beli jadi lebih gampang!</p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-[400px] bg-white rounded p-8 shadow-2xl relative">
          <h2 className="text-xl font-medium text-gray-800 mb-6">Log in</h2>
          
          {error && (
            <div className="mb-4 rounded-sm bg-[#FFF5F5] border border-[#FFC2C2] p-3">
              <h3 className="text-sm text-[#EE4D2D] text-center">{error}</h3>
            </div>
          )}

          <form className="space-y-5">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-sm border border-gray-300 px-3 py-3 text-sm placeholder-gray-400 focus:border-[#EE4D2D] focus:outline-none focus:ring-1 focus:ring-[#EE4D2D]"
                placeholder="Email/No. Handphone"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-sm border border-gray-300 px-3 py-3 text-sm placeholder-gray-400 focus:border-[#EE4D2D] focus:outline-none focus:ring-1 focus:ring-[#EE4D2D]"
                placeholder="Password"
              />
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                formAction={login}
                className="w-full bg-[#EE4D2D] py-3 px-4 text-sm font-medium text-white hover:bg-[#D73510] focus:outline-none transition-colors rounded-sm uppercase tracking-wider"
              >
                Log in
              </button>
              
              <div className="flex items-center justify-between my-2">
                <hr className="w-full border-gray-200" />
                <span className="px-3 text-xs text-gray-400 uppercase">Atau</span>
                <hr className="w-full border-gray-200" />
              </div>

              <button
                formAction={signup}
                className="w-full bg-white border border-gray-300 py-3 px-4 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:outline-none transition-colors rounded-sm"
              >
                Baru di Uchinaga? Daftar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}