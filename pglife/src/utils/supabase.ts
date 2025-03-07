import { createClient } from '@supabase/supabase-js';
import { User, Property, Payment, Subscription } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User related functions
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    return profile;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    
    return data as User;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const becomeOwner = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_owner: true })
      .eq('id', userId);
      
    if (error) {
      console.error('Error becoming owner:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
};

// Property related functions
export const getProperties = async (filters?: any): Promise<Property[]> => {
  try {
    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', 'approved');
      
    // Apply filters if provided
    if (filters) {
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      if (filters.minRent) {
        query = query.gte('rent_amount', filters.minRent);
      }
      
      if (filters.maxRent) {
        query = query.lte('rent_amount', filters.maxRent);
      }
      
      if (filters.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }
      
      if (filters.furnishingStatus) {
        query = query.eq('furnishing_status', filters.furnishingStatus);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
    
    return data as Property[];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const getPropertyById = async (id: string): Promise<Property | null> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching property:', error);
      return null;
    }
    
    return data as Property;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const createProperty = async (property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property | null> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .insert([{ ...property, status: 'pending' }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating property:', error);
      return null;
    }
    
    return data as Property;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const updateProperty = async (id: string, updates: Partial<Property>): Promise<Property | null> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating property:', error);
      return null;
    }
    
    return data as Property;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export async function uploadImage(file: File, bucket: string, path: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
      
    if (uploadError) {
      throw uploadError;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

export async function deleteImage(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

// Subscription related functions
export const createSubscription = async (subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscription])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating subscription:', error);
      return null;
    }
    
    return data as Subscription;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No active subscription found
        return null;
      }
      console.error('Error fetching subscription:', error);
      return null;
    }
    
    return data as Subscription;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

// Payment related functions
export const createPayment = async (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment | null> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating payment:', error);
      return null;
    }
    
    return data as Payment;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const updatePayment = async (id: string, updates: Partial<Payment>): Promise<Payment | null> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating payment:', error);
      return null;
    }
    
    return data as Payment;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export async function createRazorpayOrder(amount: number, currency: string = 'INR'): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: { amount, currency },
    });
    
    if (error) {
      throw error;
    }
    
    return data.order_id;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return null;
  }
}

export async function verifyRazorpayPayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
      body: { orderId, paymentId, signature },
    });
    
    if (error) {
      throw error;
    }
    
    return data.isValid;
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return false;
  }
} 