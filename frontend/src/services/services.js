// One small function per API endpoint, grouped by feature.
import { api } from './api.js';

const qs = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : '';
};

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  registerRestaurant: (data) => api.post('/auth/register-restaurant', data),
  me: () => api.get('/auth/me'),
};

export const catalogApi = {
  categories: () => api.get('/categories'),
  restaurants: (params) => api.get(`/restaurants${qs(params)}`),
  restaurant: (id) => api.get(`/restaurants/${id}`),
  popularFoods: () => api.get('/foods/popular'),
  food: (id) => api.get(`/foods/${id}`),
  search: (params) => api.get(`/foods/search${qs(params)}`),
};

export const cartApi = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.del(`/cart/${itemId}`),
  clear: () => api.del('/cart'),
};

export const addressApi = {
  list: () => api.get('/addresses'),
  create: (data) => api.post('/addresses', data),
  remove: (id) => api.del(`/addresses/${id}`),
};

export const orderApi = {
  create: (data) => api.post('/orders', data),
  list: () => api.get('/orders'),
  get: (id) => api.get(`/orders/${id}`),
};

export const partnerApi = {
  dashboard: () => api.get('/restaurant/dashboard'),
  foods: () => api.get('/restaurant/foods'),
  createFood: (formData) => api.upload('/restaurant/foods', formData, 'POST'),
  updateFood: (id, formData) => api.upload(`/restaurant/foods/${id}`, formData, 'PUT'),
  setAvailability: (id, isAvailable) => api.patch(`/restaurant/foods/${id}/availability`, { is_available: isAvailable }),
  deleteFood: (id) => api.del(`/restaurant/foods/${id}`),
  orders: (status) => api.get(`/restaurant/orders${qs({ status })}`),
  updateOrderStatus: (id, status) => api.put(`/restaurant/orders/${id}/status`, { status }),
};

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  users: (params) => api.get(`/admin/users${qs(params)}`),
  user: (id) => api.get(`/admin/users/${id}`),
  setUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { is_active: isActive }),
  restaurants: (params) => api.get(`/admin/restaurants${qs(params)}`),
  setRestaurantStatus: (id, status) => api.put(`/admin/restaurants/${id}/status`, { status }),
  orders: (params) => api.get(`/admin/orders${qs(params)}`),
  order: (id) => api.get(`/admin/orders/${id}`),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.del(`/admin/categories/${id}`),
};
