export default function SellerLoading() {
  return (
    <div className="min-h-screen bg-[#F6F6F6] font-sans flex flex-col">
      <header className="bg-white shadow-sm h-14 flex items-center px-4 md:px-6 sticky top-0 z-20">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
      </header>
      <div className="flex flex-1">
        <aside className="w-[240px] bg-white h-[calc(100vh-56px)] hidden md:block border-r border-gray-200 p-4">
          <div className="space-y-4">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse" />
        </main>
      </div>
    </div>
  )
}
