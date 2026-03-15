/**
 * Centralized API endpoint resources for Tiktak Admin.
 */

export const API = {
  auth: {
    login: "/api/tiktak/auth/admin/login",
    refresh: "/api/tiktak/auth/refresh",
  },
  admin: {
    profile: "/api/tiktak/admin/profile",
    users: "/api/tiktak/admin/users",
  },
  category: {
    create: "/api/tiktak/admin/category",
    update: (id: number | string) => `/api/tiktak/admin/categories/${id}`,
    delete: (id: number | string) => `/api/tiktak/admin/categories/${id}`,
    getAll: "/api/tiktak/admin/categories",
  },
  product: {
    create: "/api/tiktak/admin/product",
    update: (id: number | string) => `/api/tiktak/admin/products/${id}`,
    delete: (id: number | string) => `/api/tiktak/admin/products/${id}`,
    getAll: "/api/tiktak/admin/products",
  },
  campaign: {
    create: "/api/tiktak/admin/campaign",
    update: (id: number | string) => `/api/tiktak/admin/campaigns/${id}`,
    delete: (id: number | string) => `/api/tiktak/admin/campaigns/${id}`,
    getAll: "/api/tiktak/admin/campaigns",
  },
  order: {
    getAll: "/api/tiktak/orders/admin",
    getStats: "/api/tiktak/orders/admin/stats",
    updateStatus: (id: number | string) =>
      `/api/tiktak/orders/admin/${id}/status`,
  },
  users: {
    getAll: "/api/tiktak/admin/users",
  },
  upload: {
    upload: "/api/tiktak/upload",
  },
};

export default API;
