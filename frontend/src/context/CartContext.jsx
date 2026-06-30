import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, addToCart, removeFromCart, updateCartItem } from '../api/cart.api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState(null); // { productName, imageUrl, action }
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn()) {
      fetchCart();
    } else {
      setCart([]);
      setCartCount(0);
    }
  }, [user]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchCart = async () => {
    try {
      const res = await getCart();
      setCart(res.data);
      // Fix: total quantity across all cart items, not just count of unique products
      const totalQty = res.data.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(totalQty);
    } catch (err) {
      console.error(err);
    }
  };

  const addItem = async (productId, quantity = 1, productInfo = null) => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(productId, quantity);
      await fetchCart();
      // Show Blinkit-style toast
      setToast({
        type: 'added',
        productName: productInfo?.name || 'Item',
        imageUrl: productInfo?.image || null,
      });
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', productName: 'Error adding item' });
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
      await fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const updateItem = async (cartItemId, quantity) => {
    try {
      await updateCartItem(cartItemId, quantity);
      await fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const dismissToast = () => setToast(null);

  const totalAmount = cart.reduce(
    (sum, item) => sum + (item?.product?.price ?? 0) * (item?.quantity ?? 0), 0
  );

  return (
    <CartContext.Provider value={{
      cart, cartCount, addItem, removeItem, updateItem, fetchCart, totalAmount, toast, dismissToast
    }}>
      {children}

      {/* ── BLINKIT-STYLE FLOATING CART TOAST ── */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateX(-50%) translateY(16px); }
              to   { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
          `}</style>
          <div
            style={{
              backgroundColor: toast.type === 'error' ? '#dc2626' : '#1a1a1a',
              color: 'white',
              borderRadius: '14px',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minWidth: '280px',
              maxWidth: '380px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            }}
          >
            {toast.imageUrl && (
              <img
                src={toast.imageUrl}
                alt=""
                style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>
                {toast.type === 'error' ? toast.productName : '✓ Added to cart'}
              </p>
              {toast.type !== 'error' && (
                <p style={{ fontSize: '11px', color: '#aaa', margin: '2px 0 0' }}>
                  {toast.productName}
                </p>
              )}
            </div>
            <a
              href="/cart"
              style={{
                backgroundColor: '#CC0000',
                color: 'white',
                fontSize: '12px',
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                flexShrink: 0,
              }}
              onClick={dismissToast}
            >
              View Cart
            </a>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);