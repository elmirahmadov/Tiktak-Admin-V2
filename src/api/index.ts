import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';
import { API } from '../services/EndpointResources.g';

const API_BASE_URL = 'https://api.sarkhanrahimli.dev';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'lang': 'az',
  },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = useAuthStore.getState();
    const token = state.token;
    
    const isLoginRequest = config.url?.includes(API.auth.login);

    // Block non-login requests if token is missing and store is hydrated
    if (state.isHydrated && !token && !isLoginRequest) {
      console.warn(`[API] Blocked ${config.method?.toUpperCase()} ${config.url} - No token available.`);
      return Promise.reject(new Error('Auth token missing'));
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and log errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes(API.auth.login);

    if (error.response) {
      console.error(
        `[API] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.response.status}`,
        '\nRequest body:', error.config?.data ? JSON.parse(error.config.data) : null,
        '\nResponse:', error.response.data,
      );
    }
    
    if (error.response?.status === 401 && !isLoginRequest) {
      if (useAuthStore.getState().token) {
        useAuthStore.getState().logout();
      }
    }
    
    return Promise.reject(error);
  }
);

// ============ AUTH ============
export const authAPI = {
  login: (phone: string, password: string) =>
    api.post(API.auth.login, { phone, password }),
};

// ============ PROFILE ============
export const profileAPI = {
  get: () => api.get(API.admin.profile),
};

// ============ USERS ============
export const usersAPI = {
  list: () => api.get(API.users.getAll),
};

// ============ CATEGORIES ============
export const categoriesAPI = {
  list: () => api.get(API.category.getAll),
  create: (data: any) => api.post(API.category.create, data),
  update: (id: string | number, data: any) => api.put(API.category.update(id), data),
  remove: (id: string | number) => api.delete(API.category.delete(id)),
};

// ============ PRODUCTS ============
export const productsAPI = {
  list: (params?: any) => api.get(API.product.getAll, { params }),
  create: (data: any) => api.post(API.product.create, data),
  update: (id: string | number, data: any) => api.put(API.product.update(id), data),
  remove: (id: string | number) => api.delete(API.product.delete(id)),
};

// ============ CAMPAIGNS ============
export const campaignsAPI = {
  list: () => api.get(API.campaign.getAll),
  create: (data: any) => api.post(API.campaign.create, data),
  update: (id: string | number, data: any) => api.put(API.campaign.update(id), data),
  remove: (id: string | number) => api.delete(API.campaign.delete(id)),
};

// ============ ORDERS ============
export const ordersAPI = {
  list: () => api.get(API.order.getAll),
  stats: () => api.get(API.order.getStats),
  updateStatus: (id: string | number, status: string) =>
    api.put(API.order.updateStatus(id), { status }),
};

// ============ UPLOAD ============
export const uploadAPI = {
  upload: (formData: FormData) => 
    api.post(API.upload.upload, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export default api;
