export interface Campaign {
  id: string | number;
  title: string;
  image?: string;
  description?: string;
  is_active?: boolean;
}

export interface Category {
  id: string | number;
  title: string;
  name?: string;
  image?: string;
  img_url?: string;
  description?: string;
  created_at?: string;
}

export interface Product {
  id: string | number;
  title: string;
  description: string;
  price: string | number;
  category_id: string | number;
  image?: string;
  img_url?: string;
  stock?: number;
  type?: string;
}

export interface Order {
  id: string;
  date: string;
  time: string;
  address: string;
  itemCount: number;
  total: string | number;
  deliveryFee: string;
  status: 'Gözləyir' | 'Təsdiqləndi' | 'Çatdırıldı' | 'Ləğv edildi' | 'Yoldadır';
}

export interface User {
  id: string | number;
  full_name: string;
  phone: string;
  role: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
