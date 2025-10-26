import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const uploadProductsCSV = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/products/upload-csv', formData);
};
export const getCategories = () => api.get('/products/meta/categories');

// Sales
export const getSales = (params) => api.get('/sales', { params });
export const createSale = (data) => api.post('/sales', data);
export const deleteSale = (id) => api.delete(`/sales/${id}`);
export const uploadSalesCSV = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/sales/upload-csv', formData);
};

// Analytics
export const getSummary = (params) => api.get('/analytics/summary', { params });
export const getRevenueOverTime = (params) => api.get('/analytics/revenue-over-time', { params });
export const getSalesByProduct = (params) => api.get('/analytics/sales-by-product', { params });
export const getRevenueByCategory = (params) => api.get('/analytics/revenue-by-category', { params });

export default api;