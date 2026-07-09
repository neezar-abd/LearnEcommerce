import Image from 'next/image';
import Link from 'next/link';
import { formatRupiah } from '@/lib/format';

interface ProductVariant {
  price: number | string | any;
}

interface Product {
  id: string;
  name: string;
  images: { url: string }[];
  variants: ProductVariant[];
  store?: { province?: string | null; cityId?: string | null; name?: string };
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const price = Number(product.variants[0]?.price) || 0;
  
  return (
    <Link href={`/product/${product.id}`} className="bg-white border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer rounded-xl overflow-hidden flex flex-col h-full pb-2 group">
      <div className="aspect-square bg-gray-50 w-full relative overflow-hidden shrink-0">
        <Image 
          src={product.images[0]?.url || 'https://via.placeholder.com/300'} 
          alt={product.name} 
          fill 
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw" 
          className="object-cover transition-transform duration-500 group-hover:scale-105" 
        />
      </div>
      <div className="px-3 py-2 flex flex-col flex-1">
        <h3 className="text-[13px] text-gray-800 mb-0.5 line-clamp-2 leading-tight min-h-[32px]">{product.name}</h3>
        <div className="text-base font-bold text-[#7C3AED] mb-1.5 mt-1">
          {formatRupiah(price)}
        </div>
        
        <div className="mt-auto flex flex-col gap-1.5">
          {product.store?.province && (
             <div className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {product.store.province}
             </div>
          )}
          <div className="flex items-center gap-1 text-gray-500 text-[11px]">
            <svg className="w-3 h-3 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span className="text-gray-600 font-medium">5.0</span>
            <span className="mx-1 text-gray-300">|</span>
            <span>10+ terjual</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
