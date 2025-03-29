// User types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  is_owner: boolean;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

// Property types
export type PropertyStatus = 'pending' | 'approved' | 'rejected' | 'booked';
export type PropertyType = '1BHK' | '2BHK' | '3BHK' | '4BHK' | 'Single Room' | 'Shared Room';
export type FurnishingStatus = 'furnished' | 'unfurnished' | 'semi-furnished';
export type AvailableFor = 'male' | 'female' | 'all';

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  location: string;
  rent_amount: number;
  deposit_amount: number;
  property_type: PropertyType;
  furnishing_status: FurnishingStatus;
  available_for: AvailableFor;
  amenities: string[];
  rules: string[];
  images: string[];
  status: PropertyStatus;
  created_at: string;
  updated_at: string;
}

// Subscription types
export type SubscriptionPlan = 'weekly' | 'monthly';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: SubscriptionPlan;
  amount: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Payment types
export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type PaymentType = 'subscription' | 'property_upload';

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  payment_type: PaymentType;
  payment_status: PaymentStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at: string;
  updated_at: string;
}

// Filter types
export interface PropertyFilter {
  location?: string;
  minRent?: number;
  maxRent?: number;
  propertyType?: PropertyType;
  furnishingStatus?: FurnishingStatus;
  availableFor?: AvailableFor;
  amenities?: string[];
}

export interface SearchParams extends PropertyFilter {
  page: number;
  limit: number;
  sortBy?: 'rent_amount' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// Admin Dashboard types
export interface DashboardStats {
  totalUsers: number;
  totalOwners: number;
  totalProperties: number;
  totalBookedProperties: number;
  totalPayments: number;
  recentPayments: Payment[];
  pendingApprovals: number;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
} 