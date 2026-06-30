import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, cartCount, removeItem, updateItem, totalAmount, fetchCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    } else {
      fetchCart();
    }
  }, []);

  if (!isLoggedIn()) return null;

  const shipping = totalAmount > 0 && totalAmount < 499 ? 49 : 0;
  const orderTotal = totalAmount + shipping;

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      <div className="bg-white border-b border-gray-100 py-5">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-black text-gray-900">My Cart ({cartCount} items)</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {cart.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <ShoppingBag size={56} className="mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-bold text-gray-700">Your cart is empty</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">Explore our collection and add gifts you love</p>
            <Link
              to="/products"
              className="inline-block bg-primary hover:bg-primaryDark text-white font-bold px-8 py-3 rounded-full text-sm transition-colors"
            >
              Explore Gifts
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="md:col-span-2 flex flex-col gap-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4 items-center"
                >
                  <Link to={`/products/${item.product?.id}`} className="flex-shrink-0">
                    <img
                      src={item.product?.images?.[0] || 'https://placehold.co/80x80/f7f7f7/CC0000?text=Gift'}
                      alt={item.product?.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-100"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product?.id}`}
                      className="font-semibold text-sm text-gray-800 hover:text-primary line-clamp-2 leading-snug"
                    >
                      {item.product?.name}
                    </Link>
                    <p className="text-primary font-black text-base mt-1">₹{item.product?.price}</p>
                  </div>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-sm">
                    <button
                      onClick={() =>
                        item.quantity > 1
                          ? updateItem(item.id, item.quantity - 1)
                          : removeItem(item.id)
                      }
                      className="px-3 py-1.5 hover:bg-gray-50 font-bold"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 font-semibold text-gray-800 min-w-[32px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      className="px-3 py-1.5 hover:bg-gray-50 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-300 hover:text-red-500 transition p-1.5 hover:bg-red-50 rounded-lg ml-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-fit">
              <h2 className="text-base font-black text-gray-900 mb-5 pb-3 border-b border-gray-100">Order Summary</h2>
              <div className="flex flex-col gap-3 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="font-semibold">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    Add ₹{499 - totalAmount} more to get FREE shipping!
                  </p>
                )}
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between font-black text-gray-900">
                <span>Total</span>
                <span className="text-primary text-lg">₹{orderTotal}</span>
              </div>
              <Link
                to="/checkout"
                className="mt-5 block w-full bg-primary hover:bg-primaryDark text-white text-center py-3 rounded-xl font-bold text-sm transition-colors tracking-wide"
              >
                PROCEED TO CHECKOUT
              </Link>
              <Link
                to="/products"
                className="mt-3 block w-full text-center text-sm text-gray-500 hover:text-primary transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
