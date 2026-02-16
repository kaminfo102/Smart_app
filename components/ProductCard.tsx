
import React from 'react';
import { Product } from '../types';
import { useStore } from '../contexts/StoreContext';
import { formatPrice } from '../constants';
import { ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group">
      <Link to={`/product/${product.id}`} className="block relative pt-[100%] overflow-hidden bg-gray-50 dark:bg-gray-700">
        <img 
          src={product.images[0]?.src || 'https://via.placeholder.com/300'} 
          alt={product.images[0]?.alt || product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.on_sale && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            حراج
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md truncate max-w-[70%]">
                {product.categories[0]?.name}
            </span>
            <div className="flex items-center text-yellow-400 text-xs gap-1">
                <Star className="w-3 h-3 fill-current" />
                <span>{product.average_rating}</span>
            </div>
        </div>
        
        <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight mb-2 line-clamp-2 min-h-[2.5rem] hover:text-primary-600 transition-colors">
            {product.name}
            </h3>
        </Link>

        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex items-end justify-between">
          <div className="flex flex-col">
            {product.on_sale && product.regular_price && (
                <span className="text-xs text-gray-400 line-through decoration-red-400">
                    {formatPrice(product.regular_price)}
                </span>
            )}
            <div className="flex items-center gap-1">
                <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
                    {formatPrice(product.price)}
                </span>
                <span className="text-xs text-gray-500 font-light">تومان</span>
            </div>
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={product.stock_status !== 'instock'}
            className={`p-2 rounded-xl transition-all shadow-sm ${
                product.stock_status === 'instock'
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-600 hover:text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
