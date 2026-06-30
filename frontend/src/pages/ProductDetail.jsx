import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Heart, Check } from 'lucide-react';
import { getProductById } from '../api/product.api';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getProductById(id);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAddToCart = async () => {
    await addItem(product.id, quantity, { name: product.name, image: product.images?.[0] });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 animate-pulse">
          <div className="bg-gray-100 rounded-2xl h-96" />
          <div className="flex flex-col gap-4">
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-6 bg-gray-100 rounded w-1/4" />
            <div className="h-24 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24 text-gray-400">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-lg font-bold text-gray-600">Product not found</p>
        <Link to="/products" className="text-primary mt-4 inline-block hover:underline text-sm">
          ← Back to Products
        </Link>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : ['https://placehold.co/600x600/f7f7f7/CC0000?text=Gift'];

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="container mx-auto px-4">
          <Link to="/products" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft size={15} /> Back to Products
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {/* Images */}
          <div>
            <div className="rounded-xl overflow-hidden border border-gray-100 mb-3 bg-[#f7f7f7]">
              <img
                src={images[activeImg]}
                alt={product.name}
                className="w-full h-[380px] object-contain"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`border-2 rounded-lg overflow-hidden transition-all ${i === activeImg ? 'border-primary' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <img src={img} alt="" className="w-14 h-14 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.category && (
              <Link
                to={`/products?category=${product.category.name?.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-xs font-bold text-primary uppercase tracking-widest mb-2 hover:underline"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="text-2xl font-black text-gray-900 mb-3 leading-snug">{product.name}</h1>
            <p className="text-3xl font-black text-primary mb-4">₹{product.price}</p>

            {/* Stock badge */}
            <div className="mb-4">
              {product.stock === 0 ? (
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
              ) : product.stock < 10 ? (
                <span className="bg-red-50 text-primary text-xs font-bold px-3 py-1 rounded-full border border-red-100">
                  Only {product.stock} left!
                </span>
              ) : (
                <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-100">
                  In Stock
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Quantity:</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2.5 text-lg hover:bg-gray-50 font-bold"
                >
                  −
                </button>
                <span className="px-5 py-2.5 text-sm font-bold text-gray-800 min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  className="px-4 py-2.5 text-lg hover:bg-gray-50 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 tracking-wide ${
                  added
                    ? 'bg-green-600 text-white'
                    : product.stock === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-primary hover:bg-primaryDark text-white'
                }`}
              >
                {added ? (
                  <><Check size={17} /> Added to Cart!</>
                ) : (
                  <><ShoppingCart size={17} /> Add to Cart</>
                )}
              </button>
              <button className="border border-gray-200 rounded-xl px-4 py-3.5 hover:bg-red-50 hover:border-primary transition-all">
                <Heart size={20} className="text-gray-400 hover:text-primary" />
              </button>
            </div>

            {/* Features */}
            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-3">
              {[
                { icon: '🚚', text: 'Free shipping over ₹499' },
                { icon: '↩️', text: '7-day easy returns' },
                { icon: '🔒', text: 'Secure checkout' },
                { icon: '🎁', text: 'Gift wrapping available' },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{f.icon}</span> {f.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
