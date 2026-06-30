import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { getMyOrders } from '../api/order.api';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return; }
    const fetch = async () => {
      try {
        const res = await getMyOrders();
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (!isLoggedIn()) return null;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">My Orders</h1>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <Package size={56} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No orders yet</p>
          <Link to="/products" className="text-primary mt-4 inline-block hover:underline font-medium">
            Start Shopping →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-primary">₹{order.totalAmount}</span>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {order.items?.map((item) => (
                  <Link key={item.id} to={`/products/${item.product?.id}`} className="flex-shrink-0">
                    <img
                      src={item.product?.images?.[0] || 'https://via.placeholder.com/60x60?text=Gift'}
                      alt={item.product?.name}
                      className="w-14 h-14 object-cover rounded-lg border border-gray-100"
                    />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
