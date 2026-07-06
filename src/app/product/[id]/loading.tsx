export default function ProductLoading() {
  return (
    <div className="bg-[#F6F6F6] min-h-screen pb-24 md:pb-0 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
          {/* Image Skeleton */}
          <div className="w-full lg:w-[45%]">
            <div className="aspect-square bg-white rounded-2xl shadow-sm border border-gray-100 p-2 md:p-4 mb-4">
              <div className="w-full h-full bg-gray-200 rounded-xl animate-pulse" />
            </div>
            <div className="grid grid-cols-4 gap-2 md:gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          {/* Info Skeleton */}
          <div className="w-full lg:w-[55%] flex flex-col">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
              <div className="h-8 w-3/4 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="h-6 w-1/4 bg-gray-200 rounded mb-6 animate-pulse" />
              <div className="h-10 w-1/3 bg-gray-200 rounded mb-8 animate-pulse" />
              
              <div className="space-y-4 mb-8">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
              </div>

              <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
