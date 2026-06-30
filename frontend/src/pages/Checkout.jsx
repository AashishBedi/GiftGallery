import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle, Truck, CreditCard, Smartphone, ChevronRight, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { placeOrder, createPaymentOrder, verifyPayment } from '../api/order.api';

const RAZORPAY_KEY = 'rzp_test_T6XJRmypFeClpQ';

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PAYMENT_METHODS = [
  {
    id: 'cod',
    icon: <Truck size={20} />,
    label: 'Cash on Delivery',
    desc: 'Pay when your order arrives',
    badge: null,
  },
  {
    id: 'online',
    icon: <Smartphone size={20} />,
    label: 'Online Payment',
    desc: 'UPI, Net Banking, Wallets via Razorpay',
    badge: 'Popular',
  },
  {
    id: 'card',
    icon: <CreditCard size={20} />,
    label: 'Credit / Debit Card',
    desc: 'Visa, Mastercard, RuPay accepted',
    badge: null,
  },
];

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none bg-[#fafafa] transition focus:border-red-500';
const labelCls = 'text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block';

const Checkout = () => {
  const { cart, totalAmount, fetchCart } = useCart();
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');
  const navigate = useNavigate();

  const shipping = totalAmount > 0 && totalAmount < 499 ? 49 : 0;
  const orderTotal = totalAmount + shipping;

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const shippingAddressString = () =>
    `${address.street}, ${address.city}, ${address.state} - ${address.pincode} | Ph: ${address.phone}`;

  // ── COD Flow ──
  const handleCOD = async () => {
    const res = await placeOrder(shippingAddressString());
    setOrderId(res.data?.id || '');
    await fetchCart();
    setSuccess(true);
  };

  // ── Razorpay (Online / Card) Flow ──
  const handleRazorpay = async () => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      setError('Failed to load payment gateway. Please try again.');
      return;
    }

    // 1. Create backend order first, to get the order ID for stock deduction
    const orderRes = await placeOrder(shippingAddressString());
    const backendOrderId = orderRes.data?.id;

    // 2. Create Razorpay payment order
    const payRes = await createPaymentOrder(orderTotal);
    const { orderId: rzpOrderId, amount, currency, keyId } = payRes.data;

    const options = {
      key: keyId || RAZORPAY_KEY,
      amount: Math.round(orderTotal * 100),
      currency: currency || 'INR',
      name: 'Gift Gallery',
      description: 'Order Payment',
      order_id: rzpOrderId,
      handler: async (response) => {
        try {
          await verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            orderId: backendOrderId,
          });
          setOrderId(backendOrderId || '');
          await fetchCart();
          setSuccess(true);
        } catch {
          setError('Payment verification failed. Contact support with payment ID: ' + response.razorpay_payment_id);
        }
      },
      prefill: { contact: address.phone },
      theme: { color: '#CC0000' },
      modal: {
        ondismiss: () => {
          setError('Payment was cancelled. Your order has been placed but payment is pending.');
          setLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);
    setError('');
    try {
      if (paymentMethod === 'cod') {
        await handleCOD();
      } else {
        await handleRazorpay();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-md w-full">
          <div
            className="mx-auto mb-5 flex items-center justify-center rounded-full"
            style={{ width: '80px', height: '80px', backgroundColor: '#f0fdf4' }}
          >
            <CheckCircle size={48} color="#16a34a" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Order Placed! 🎉</h2>
          <p className="text-gray-500 text-sm mb-1">Thank you for shopping with Gift Gallery</p>
          {orderId && (
            <p className="text-xs text-gray-400 mb-6 font-mono bg-gray-50 px-3 py-2 rounded-lg inline-block">
              Order ID: {orderId.slice(0, 18)}…
            </p>
          )}
          <p className="text-xs text-gray-400 mb-6">
            {paymentMethod === 'cod'
              ? '💵 Cash on Delivery — pay when your order arrives.'
              : '✅ Payment successful — your order is confirmed.'}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/orders')}
              style={{ backgroundColor: '#CC0000' }}
              className="text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/')}
              className="border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Lock size={15} className="text-gray-400" />
          <h1 className="text-lg font-black text-gray-900">Secure Checkout</h1>
          <span className="text-xs text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full font-medium ml-auto">
            SSL Secured
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">

          {/* ── Left Column: Address + Payment ── */}
          <div className="md:col-span-2 flex flex-col gap-5">

            {/* Address Form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-black text-gray-900 mb-5 flex items-center gap-2">
                <MapPin size={16} style={{ color: '#CC0000' }} /> Shipping Address
              </h2>
              {error && (
                <div
                  className="text-sm rounded-xl px-4 py-3 mb-4"
                  style={{ backgroundColor: '#fff0f0', border: '1px solid #ffd0d0', color: '#CC0000' }}
                >
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelCls}>Street Address</label>
                  <input name="street" value={address.street} onChange={handleChange} required
                    placeholder="123 Main Street, Apartment 4B"
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <input name="city" value={address.city} onChange={handleChange} required
                    placeholder="Ludhiana" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <input name="state" value={address.state} onChange={handleChange} required
                    placeholder="Punjab" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Pincode</label>
                  <input name="pincode" value={address.pincode} onChange={handleChange} required
                    placeholder="141001" maxLength={6} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input name="phone" value={address.phone} onChange={handleChange} required
                    placeholder="9876543210" maxLength={10} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-black text-gray-900 mb-5 flex items-center gap-2">
                <CreditCard size={16} style={{ color: '#CC0000' }} /> Payment Method
              </h2>
              <div className="flex flex-col gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all"
                    style={{
                      borderColor: paymentMethod === method.id ? '#CC0000' : '#e5e7eb',
                      backgroundColor: paymentMethod === method.id ? '#fff5f5' : 'white',
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="sr-only"
                    />
                    {/* Radio circle */}
                    <div
                      className="flex-shrink-0 rounded-full border-2 flex items-center justify-center"
                      style={{
                        width: '20px', height: '20px',
                        borderColor: paymentMethod === method.id ? '#CC0000' : '#d1d5db',
                      }}
                    >
                      {paymentMethod === method.id && (
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#CC0000' }} />
                      )}
                    </div>
                    {/* Icon */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-xl"
                      style={{
                        width: '42px', height: '42px',
                        backgroundColor: paymentMethod === method.id ? '#CC0000' : '#f3f4f6',
                        color: paymentMethod === method.id ? 'white' : '#6b7280',
                      }}
                    >
                      {method.icon}
                    </div>
                    {/* Text */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800">{method.label}</span>
                        {method.badge && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: '#fff3e0', color: '#f57c00' }}
                          >
                            {method.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{method.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                  </label>
                ))}
              </div>

              {/* Razorpay logos */}
              {(paymentMethod === 'online' || paymentMethod === 'card') && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400">Powered by</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Razorpay</span>
                  {['Visa', 'Mastercard', 'UPI', 'NetBanking'].map((b) => (
                    <span key={b} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-medium">{b}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right Column: Order Summary ── */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
              <h2 className="text-base font-black text-gray-900 mb-4">Order Summary</h2>
              <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.product?.images?.[0] || 'https://placehold.co/40x40/f7f7f7/CC0000?text=Gift'}
                      alt=""
                      className="w-10 h-10 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                      ₹{((item.product?.price ?? 0) * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
                    Add ₹{(499 - totalAmount).toFixed(0)} more for FREE shipping
                  </p>
                )}
                <div className="flex justify-between font-black text-gray-900 text-base pt-2 border-t border-gray-100 mt-1">
                  <span>Total</span>
                  <span style={{ color: '#CC0000' }}>₹{orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <form onSubmit={handleSubmit}>
                <button
                  type="submit"
                  disabled={loading || cart.length === 0 || !address.street || !address.city || !address.state || !address.pincode || !address.phone}
                  className="mt-5 w-full text-white font-black py-3.5 rounded-xl text-sm transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#CC0000' }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Processing…
                    </span>
                  ) : (
                    <>
                      {paymentMethod === 'cod' ? '📦 Place Order (COD)' : '🔒 Pay ₹' + orderTotal.toFixed(0)}
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                <Lock size={10} /> 100% Secure Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
