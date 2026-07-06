export default function BuyerLoading() {
  return (
    <div className="min-h-screen bg-[#F6F6F6] pb-20 md:pb-0">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex gap-6">
          <aside className="w-[250px] hidden md:block">
            <div className="bg-white rounded-xl shadow-sm p-4 h-64 animate-pulse">
              <div className="h-16 w-16 bg-gray-200 rounded-full mb-4 mx-auto" />
              <div className="h-4 w-32 bg-gray-200 rounded mx-auto mb-2" />
              <div className="h-3 w-24 bg-gray-200 rounded mx-auto" />
            </div>
          </aside>
          <main className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6 h-[400px] animate-pulse">
              <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
              <div className="space-y-4">
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
                <div className="h-4 w-4/6 bg-gray-200 rounded" />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
