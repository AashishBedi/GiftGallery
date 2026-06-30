import api from './axios';

export const getProducts = (page = 0, size = 50) =>
  api.get(`/api/products?page=${page}&size=${size}`);

export const getProductById = (id) => api.get(`/api/products/${id}`);

export const getProductsByCategory = (categoryId, page = 0) =>
  api.get(`/api/products/category/${categoryId}?page=${page}`);

export const searchProducts = (q) => api.get(`/api/products/search?q=${q}`);

export const createProduct = (formData) =>
  api.post('/api/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// updateProduct uses form-data to match backend @RequestParam (no image change)
export const updateProduct = (id, formData) =>
  api.put(`/api/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteProduct = (id) => api.delete(`/api/products/${id}`);