import api from './axios';

export const getCart = () => api.get('/api/cart');
export const addToCart = (productId, quantity) =>
  api.post('/api/cart/add', { productId, quantity });
export const updateCartItem = (cartItemId, quantity) =>
  api.put(`/api/cart/${cartItemId}`, { quantity });
export const removeFromCart = (cartItemId) =>
  api.delete(`/api/cart/${cartItemId}`);