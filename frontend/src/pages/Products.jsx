import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Search, Filter } from 'lucide-react';
import { getProducts, searchProducts, getProductsByCategory } from '../api/product.api';
import { getCategories } from '../api/category.api';
import { useCart } from '../context/CartContext';

// Shared product card component
export const ProductCard = ({ product }) => {
  const { addItem } = useCart();

  return (
    <div className="bg-white rounded-lg border border-gray-100 hover:border-primary hover:shadow-md transition-all duration-200 group overflow-hidden">
      <div className="relative overflow-hidden">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.images?.[0] || 'https://placehold.co/300x300/f7f7f7/CC0000?text=Gift'}
            alt={product.name}
            className="w-full h-52 object-cover group-hover:scale-103 transition-transform duration-300"
          />
        </Link>
        <button className="absolute top-2.5 right-2.5 bg-white rounded-full p-1.5 shadow-sm hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
          <Heart size={15} />
        </button>
        {product.stock > 0 && product.stock < 10 && (
          <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded">
            LOW STOCK
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2.5 left-2.5 bg-gray-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
            OUT OF STOCK
          </span>
        )}
      </div>
      <div className="p-3">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-medium text-sm text-gray-800 hover:text-primary hover:underline line-clamp-2 mb-1.5 leading-snug">
            {product.name}
          </h3>
        </Link>
        <p className="text-primary font-bold text-base mb-2.5">₹{product.price}</p>
        <button
          onClick={() => addItem(product.id, 1, { name: product.name, image: product.images?.[0] })}
          disabled={product.stock === 0}
          className="w-full bg-primary hover:bg-primaryDark disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-2 rounded text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-1.5"
        >
          <ShoppingCart size={13} />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [offline, setOffline] = useState(false);

  const searchQ = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category') || '';

  // Fetch categories once on mount to build slug → id map
  useEffect(() => {
    getCategories()
      .then((res) => { setCategories(res.data || []); setOffline(false); })
      .catch((err) => { console.error(err); setOffline(true); });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let res;

        if (searchQ) {
          // Search mode
          res = await searchProducts(searchQ);
          setProducts(res.data || []);
          setTotalPages(0);

        } else if (categorySlug) {
          // Bug 3 fix: resolve slug → category id, then call getProductsByCategory
          const matched = categories.find(
            (c) => c.name?.toLowerCase().replace(/\s+/g, '-') === categorySlug.toLowerCase() ||
                   c.slug?.toLowerCase() === categorySlug.toLowerCase()
          );
          if (matched) {
            res = await getProductsByCategory(matched.id, page);
            // Backend may return Page or plain array
            const data = res.data;
            setProducts(data.content || data || []);
            setTotalPages(data.totalPages || 0);
          } else {
            // Category not found yet (categories still loading) — show loading
            setProducts([]);
            setTotalPages(0);
          }

        } else {
          // All products
          res = await getProducts(page, 12);
          setProducts(res.data.content || []);
          setTotalPages(res.data.totalPages || 0);
        }
      } catch (err) {
        console.error(err);
        setProducts([]);
        setOffline(true);
      } finally {
        setLoading(false);
      }
    };

    // Wait for categories to load before filtering by slug
    if (categorySlug && categories.length === 0) return;
    fetchProducts();
  }, [searchQ, categorySlug, page, categories]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ search: searchInput.trim() });
      setPage(0);
    }
  };

  const pageTitle = searchQ
    ? `Results for "${searchQ}"`
    : categorySlug
    ? categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'All Gifts';

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      {/* Offline banner */}
      {offline && (
        <div style={{ backgroundColor: '#fff3cd', borderBottom: '1px solid #ffc107' }} className="text-center py-2.5 text-sm font-medium text-yellow-800">
          ⚠️ Backend server is offline. Please start your Spring Boot server on port 8080.
        </div>
      )}
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
            {!loading && (
              <p className="text-sm text-gray-400 mt-0.5">{products.length} products</p>
            )}
          </div>
          <form onSubmit={handleSearch} className="flex border border-gray-300 rounded-full overflow-hidden max-w-sm w-full bg-white">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search gifts..."
              className="flex-1 px-4 py-2 text-sm outline-none bg-transparent"
            />
            <button type="submit" className="bg-primary hover:bg-primaryDark text-white px-4 transition-colors">
              <Search size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
            <Link
              to="/products"
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${!categorySlug && !searchQ ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary bg-white'}`}
            >
              All
            </Link>
            {categories.map((cat) => {
              const slug = cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-');
              const isActive = categorySlug === slug;
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${slug}`}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${isActive ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary bg-white'}`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Products grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-72 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">🎁</p>
            <p className="text-lg font-medium text-gray-600">No products found</p>
            <p className="text-sm mt-1">Try a different category or search term</p>
            <Link to="/products" className="mt-4 inline-block text-primary text-sm font-medium hover:underline">
              Browse all gifts →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-5 py-2 rounded border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
            >
              ← Prev
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-5 py-2 rounded border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
