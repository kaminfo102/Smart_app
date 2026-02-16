
import React, { useEffect, useState } from 'react';
import { wooService } from '../services/wooService';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import HeroCarousel from '../components/HeroCarousel';
import { Sparkles, Filter, X, Search, SlidersHorizontal, AlertOctagon, RefreshCcw, ChevronDown, Check } from 'lucide-react';

const Store: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<{min: string, max: string}>({min: '', max: ''});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date-desc'); // date-desc, price-asc, price-desc

  // Fetch Categories once
  useEffect(() => {
      wooService.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch Products on Filter Change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(false);
      try {
        const [sortBy, order] = sortOption.split('-');
        const params: any = {
            orderby: sortBy,
            order: order,
        };
        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery) params.search = searchQuery;
        if (priceRange.min) params.min_price = priceRange.min;
        if (priceRange.max) params.max_price = priceRange.max;

        const data = await wooService.getProducts(params);
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
        fetchProducts();
    }, 500); // Debounce for search/inputs

    return () => clearTimeout(debounce);
  }, [selectedCategory, priceRange, searchQuery, sortOption]);

  const handleClearFilters = () => {
      setSelectedCategory(null);
      setPriceRange({min: '', max: ''});
      setSearchQuery('');
      setSortOption('date-desc');
  };

  if (error && products.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-6 rounded-full text-yellow-600 dark:text-yellow-400 animate-pulse">
                  <AlertOctagon className="w-16 h-16" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">خطا در دریافت اطلاعات</h1>
              <p className="text-gray-500 max-w-md">
                  لطفا اتصال اینترنت خود را بررسی کنید یا دقایقی دیگر تلاش نمایید.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
              >
                  <RefreshCcw className="w-5 h-5" />
                  تلاش مجدد
              </button>
          </div>
      );
  }

  return (
    <div className="pb-10 pt-4 px-2 md:px-0">
      
      {/* Mobile Filter Toggle & Search */}
      <div className="md:hidden flex gap-2 mb-4 sticky top-20 z-20">
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center px-3">
             <Search className="w-5 h-5 text-gray-400" />
             <input 
                type="text" 
                placeholder="جستجو در محصولات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none p-3 text-sm"
             />
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="bg-primary-600 text-white p-3 rounded-xl shadow-lg shadow-primary-500/30"
          >
              <SlidersHorizontal className="w-6 h-6" />
          </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 relative">
          
          {/* Sidebar / Drawer */}
          <aside className={`
            fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none md:transform-none md:static md:w-64 md:block md:bg-transparent md:dark:bg-transparent
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          `}>
             <div className="h-full overflow-y-auto p-6 md:p-0 md:pr-2 space-y-8">
                 <div className="flex items-center justify-between md:hidden mb-6">
                     <h2 className="font-bold text-lg">فیلترها</h2>
                     <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                         <X className="w-5 h-5" />
                     </button>
                 </div>

                 {/* Desktop Search */}
                 <div className="hidden md:block space-y-3">
                     <label className="text-sm font-bold text-gray-700 dark:text-gray-300">جستجو</label>
                     <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center px-3 focus-within:ring-2 focus-within:ring-primary-500 transition-all shadow-sm">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="نام محصول..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none outline-none p-3 text-sm"
                        />
                     </div>
                 </div>

                 {/* Categories */}
                 <div className="space-y-3">
                     <label className="text-sm font-bold text-gray-700 dark:text-gray-300">دسته‌بندی‌ها</label>
                     <div className="space-y-2">
                         <button 
                            onClick={() => setSelectedCategory(null)}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${selectedCategory === null ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                         >
                             <span>همه محصولات</span>
                             {selectedCategory === null && <Check className="w-4 h-4" />}
                         </button>
                         {categories.map(cat => (
                             <button 
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.id ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                             >
                                 <span>{cat.name}</span>
                                 <span className="text-xs text-gray-400">({cat.count})</span>
                             </button>
                         ))}
                     </div>
                 </div>

                 {/* Price Filter */}
                 <div className="space-y-3">
                     <label className="text-sm font-bold text-gray-700 dark:text-gray-300">محدوده قیمت (تومان)</label>
                     <div className="grid grid-cols-2 gap-2">
                         <input 
                            type="number" 
                            placeholder="از" 
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none focus:border-primary-500"
                         />
                         <input 
                            type="number" 
                            placeholder="تا" 
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none focus:border-primary-500"
                         />
                     </div>
                 </div>

                 <button 
                    onClick={handleClearFilters}
                    className="w-full py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                 >
                     حذف فیلترها
                 </button>
             </div>
          </aside>
          
          {/* Overlay for mobile sidebar */}
          {isSidebarOpen && (
              <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
             
             {/* Hero only on initial view */}
             {!selectedCategory && !searchQuery && (
                <div className="mb-10 hidden md:block">
                     <HeroCarousel products={products.slice(0, 5)} />
                </div>
             )}

             {/* Sort & Header */}
             <div className="flex items-center justify-between mb-6">
                 <h1 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    {searchQuery ? `نتایج جستجو: "${searchQuery}"` : selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'فروشگاه'}
                 </h1>
                 
                 <div className="relative group">
                     <select 
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 pr-8 text-sm outline-none focus:border-primary-500 cursor-pointer"
                     >
                         <option value="date-desc">جدیدترین</option>
                         <option value="price-asc">ارزان‌ترین</option>
                         <option value="price-desc">گران‌ترین</option>
                         <option value="popularity-desc">محبوب‌ترین</option>
                     </select>
                     <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                 </div>
             </div>

             {/* Product Grid */}
             {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                     {[1,2,3,4,5,6].map(i => (
                         <div key={i} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                     ))}
                </div>
             ) : products.length > 0 ? (
                 <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                 </div>
             ) : (
                 <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                     <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-400 mb-4">
                         <Filter className="w-8 h-8" />
                     </div>
                     <h3 className="font-bold text-lg mb-2">محصولی یافت نشد</h3>
                     <p className="text-gray-500">لطفا فیلترهای جستجو را تغییر دهید.</p>
                     <button onClick={handleClearFilters} className="mt-4 text-primary-600 font-bold hover:underline">
                         نمایش همه محصولات
                     </button>
                 </div>
             )}
          </main>
      </div>
    </div>
  );
};

export default Store;
