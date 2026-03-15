import { create } from 'zustand';
import { Category, Product, Campaign, Order } from '../types';

interface DataStore {
  categories: Category[];
  products: Product[];
  campaigns: Campaign[];
  orders: Order[];
  loading: boolean;
  setCategories: (categories: Category[]) => void;
  setProducts: (products: Product[]) => void;
  setCampaigns: (campaigns: Campaign[]) => void;
  setOrders: (orders: Order[]) => void;
  setLoading: (loading: boolean) => void;
  
  // CRUD actions for Categories
  addCategory: (category: Category) => void;
  updateCategory: (id: string | number, category: Partial<Category>) => void;
  deleteCategory: (id: string | number) => void;

  // CRUD actions for Campaigns
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string | number, campaign: Partial<Campaign>) => void;
  deleteCampaign: (id: string | number) => void;
  
  // CRUD actions for Products
  addProduct: (product: Product) => void;
  updateProduct: (id: string | number, product: Partial<Product>) => void;
  deleteProduct: (id: string | number) => void;
}

export const useDataStore = create<DataStore>((set) => ({
  categories: [],
  products: [],
  campaigns: [],
  orders: [],
  loading: false,
  setCategories: (categories) => set({ categories }),
  setProducts: (products) => set({ products }),
  setCampaigns: (campaigns) => set({ campaigns }),
  setOrders: (orders) => set({ orders }),
  setLoading: (loading) => set({ loading }),

  addCategory: (category) => set((state) => ({ categories: [category, ...state.categories] })),
  updateCategory: (id, category) => set((state) => ({
    categories: state.categories.map((c) => (c.id === id ? { ...c, ...category } : c))
  })),
  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter((c) => c.id !== id)
  })),

  addCampaign: (campaign) => set((state) => ({ campaigns: [campaign, ...state.campaigns] })),
  updateCampaign: (id, campaign) => set((state) => ({
    campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...campaign } : c))
  })),
  deleteCampaign: (id) => set((state) => ({
    campaigns: state.campaigns.filter((c) => c.id !== id)
  })),

  addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
  updateProduct: (id, product) => set((state) => ({
    products: state.products.map((p) => (p.id === id ? { ...p, ...product } : p))
  })),
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p.id !== id)
  })),
}));
