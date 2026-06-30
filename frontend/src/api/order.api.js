import api from './axios';

export const placeOrder = (shippingAddress) =>
  api.post('/api/orders', { shippingAddress });

export const getMyOrders = () => api.get('/api/orders/my');

// Admin
export const getAllOrders = () => api.get('/api/orders/admin/all');
export const updateOrderStatus = (orderId, status) =>
  api.put(`/api/orders/admin/${orderId}/status`, { status });

export const createPaymentOrder = (amount) =>
  api.post('/api/payment/create-order', { amount: String(amount) });

export const verifyPayment = (data) =>
  api.post('/api/payment/verify', data);