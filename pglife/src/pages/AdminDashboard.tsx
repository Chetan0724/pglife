import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { Property, User, Payment, DashboardStats } from '../types';
import { getCurrentUser } from '../utils/supabase';
import { formatCurrency, formatDate } from '../lib/utils';
import { Users, Home, CreditCard, LayoutDashboard, CheckCircle, XCircle, AlertCircle, BarChart } from 'lucide-react';

// Mock data for dashboard stats
const mockStats: DashboardStats = {
  totalUsers: 245,
  totalOwners: 78,
  totalProperties: 156,
  totalBookedProperties: 89,
  totalPayments: 134,
  recentPayments: [
    {
      id: '1',
      user_id: '123',
      amount: 299,
      payment_type: 'subscription',
      payment_status: 'completed',
      created_at: '2023-07-15T10:30:00Z',
      updated_at: '2023-07-15T10:35:00Z',
    },
    {
      id: '2',
      user_id: '456',
      amount: 99,
      payment_type: 'subscription',
      payment_status: 'completed',
      created_at: '2023-07-14T14:45:00Z',
      updated_at: '2023-07-14T14:50:00Z',
    },
    {
      id: '3',
      user_id: '789',
      amount: 100,
      payment_type: 'property_upload',
      payment_status: 'completed',
      created_at: '2023-07-13T09:15:00Z',
      updated_at: '2023-07-13T09:20:00Z',
    },
  ],
  pendingApprovals: 12,
};

// Mock data for pending properties
const mockPendingProperties = [
  {
    id: '1',
    owner_id: '123',
    title: 'Modern 1BHK Apartment',
    location: 'Koramangala, Bangalore',
    rent_amount: 15000,
    deposit_amount: 30000,
    property_type: '1BHK',
    furnishing_status: 'furnished',
    images: ['/images/property1.jpg'],
    status: 'pending',
    created_at: '2023-07-15T10:30:00Z',
  },
  {
    id: '2',
    owner_id: '456',
    title: 'Spacious 2BHK Flat',
    location: 'HSR Layout, Bangalore',
    rent_amount: 22000,
    deposit_amount: 44000,
    property_type: '2BHK',
    furnishing_status: 'semi-furnished',
    images: ['/images/property2.jpg'],
    status: 'pending',
    created_at: '2023-07-14T14:45:00Z',
  },
];

// Mock data for users
const mockUsers = [
  {
    id: '123',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    is_owner: true,
    role: 'user',
    created_at: '2023-05-10T10:30:00Z',
  },
  {
    id: '456',
    name: 'Priya Patel',
    email: 'priya@example.com',
    is_owner: false,
    role: 'user',
    created_at: '2023-06-15T14:45:00Z',
  },
  {
    id: '789',
    name: 'Amit Kumar',
    email: 'amit@example.com',
    is_owner: true,
    role: 'user',
    created_at: '2023-04-20T09:15:00Z',
  },
];

const AdminDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [pendingProperties, setPendingProperties] = useState<Property[]>(mockPendingProperties as any);
  const [users, setUsers] = useState<User[]>(mockUsers as any);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const userData = await getCurrentUser();
        
        if (!userData) {
          navigate('/login');
          return;
        }
        
        if (userData.role !== 'admin') {
          navigate('/profile');
          toast.error(t('notAnAdmin'));
          return;
        }
        
        setUser(userData);
        
        // Fetch dashboard stats
        // In a real app, you would fetch this data from your backend
        // For now, we'll use mock data
        
        // Fetch pending properties
        const { data: pendingData, error: pendingError } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
          
        if (!pendingError && pendingData) {
          setPendingProperties(pendingData as Property[]);
        }
        
        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (!usersError && usersData) {
          setUsers(usersData as User[]);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error(t('errorFetchingData'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, [navigate, t]);

  const handleApproveProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: 'approved' })
        .eq('id', id);
        
      if (error) {
        console.error('Error approving property:', error);
        toast.error(t('errorApprovingProperty'));
        return;
      }
      
      setPendingProperties(pendingProperties.filter(property => property.id !== id));
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1,
        totalProperties: prev.totalProperties + 1,
      }));
      
      toast.success(t('propertyApproved'));
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('errorApprovingProperty'));
    }
  };

  const handleRejectProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: 'rejected' })
        .eq('id', id);
        
      if (error) {
        console.error('Error rejecting property:', error);
        toast.error(t('errorRejectingProperty'));
        return;
      }
      
      setPendingProperties(pendingProperties.filter(property => property.id !== id));
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1,
      }));
      
      toast.success(t('propertyRejected'));
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('errorRejectingProperty'));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('adminDashboard')}</h1>
            <p className="text-muted-foreground">
              {t('welcomeAdmin')}, {user?.name}
            </p>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="border-b border-border mb-6">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard className="w-4 h-4 inline mr-2" />
              {t('dashboard')}
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'approvals'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
              onClick={() => setActiveTab('approvals')}
            >
              <AlertCircle className="w-4 h-4 inline mr-2" />
              {t('pendingApprovals')} 
              {stats.pendingApprovals > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                  {stats.pendingApprovals}
                </span>
              )}
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <Users className="w-4 h-4 inline mr-2" />
              {t('users')}
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'properties'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
              onClick={() => setActiveTab('properties')}
            >
              <Home className="w-4 h-4 inline mr-2" />
              {t('properties')}
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
              onClick={() => setActiveTab('payments')}
            >
              <CreditCard className="w-4 h-4 inline mr-2" />
              {t('payments')}
            </button>
          </nav>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 text-primary mr-2" />
                  <h3 className="text-lg font-semibold">{t('totalUsers')}</h3>
                </div>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('includingOwners')}: {stats.totalOwners}
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <Home className="h-5 w-5 text-primary mr-2" />
                  <h3 className="text-lg font-semibold">{t('totalProperties')}</h3>
                </div>
                <p className="text-3xl font-bold">{stats.totalProperties}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('bookedProperties')}: {stats.totalBookedProperties}
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <CreditCard className="h-5 w-5 text-primary mr-2" />
                  <h3 className="text-lg font-semibold">{t('totalPayments')}</h3>
                </div>
                <p className="text-3xl font-bold">{stats.totalPayments}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('lastPayment')}: {formatDate(stats.recentPayments[0]?.created_at || new Date().toISOString())}
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-5 w-5 text-primary mr-2" />
                  <h3 className="text-lg font-semibold">{t('pendingApprovals')}</h3>
                </div>
                <p className="text-3xl font-bold">{stats.pendingApprovals}</p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm"
                  onClick={() => setActiveTab('approvals')}
                >
                  {t('viewPendingApprovals')}
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <h2 className="text-xl font-semibold mb-4">{t('recentPayments')}</h2>
            <div className="bg-card rounded-lg shadow-sm overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('id')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('user')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('amount')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('type')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('date')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats.recentPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {payment.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {payment.user_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {payment.payment_type === 'subscription' ? t('subscription') : t('propertyUpload')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(payment.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t border-border">
                <Button
                  variant="link"
                  onClick={() => setActiveTab('payments')}
                  className="p-0 h-auto"
                >
                  {t('viewAllPayments')}
                </Button>
              </div>
            </div>

            {/* Analytics */}
            <h2 className="text-xl font-semibold mb-4">{t('analytics')}</h2>
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <BarChart className="h-5 w-5 text-primary mr-2" />
                <h3 className="text-lg font-semibold">{t('monthlyStats')}</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                {t('analyticsDescription')}
              </p>
              <div className="h-64 flex items-center justify-center border border-dashed border-muted-foreground/50 rounded-md">
                <p className="text-muted-foreground">{t('analyticsPlaceholder')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Approvals Tab */}
        {activeTab === 'approvals' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">{t('pendingApprovals')}</h2>
            
            {pendingProperties.length === 0 ? (
              <div className="bg-card rounded-lg shadow-sm p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('noPropertiesPending')}</h3>
                <p className="text-muted-foreground">{t('allPropertiesReviewed')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingProperties.map((property) => (
                  <div key={property.id} className="bg-card rounded-lg shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3">
                      <div className="h-full">
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6 md:col-span-2">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">{property.title}</h3>
                            <p className="text-muted-foreground text-sm mb-2">{property.location}</p>
                            <p className="text-lg font-bold text-primary mb-2">
                              {formatCurrency(property.rent_amount)}
                              <span className="text-sm font-normal text-muted-foreground">/month</span>
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/property/${property.id}`)}
                            >
                              {t('viewDetails')}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted">
                            {property.property_type}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted">
                            {property.furnishing_status}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {t('pending')}
                          </span>
                        </div>
                        
                        <div className="border-t border-border pt-4 flex justify-end space-x-3">
                          <Button
                            variant="default"
                            onClick={() => handleApproveProperty(property.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {t('approve')}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleRejectProperty(property.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            {t('reject')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">{t('users')}</h2>
            
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('email')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('role')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('joinedOn')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.role === 'admin' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {t('admin')}
                            </span>
                          ) : user.is_owner ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {t('owner')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {t('user')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button variant="link" className="p-0 h-auto">
                            {t('viewDetails')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">{t('properties')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('propertiesTabDescription')}
            </p>
            <div className="h-64 flex items-center justify-center border border-dashed border-muted-foreground/50 rounded-md">
              <p className="text-muted-foreground">{t('propertiesTabPlaceholder')}</p>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">{t('payments')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('paymentsTabDescription')}
            </p>
            <div className="h-64 flex items-center justify-center border border-dashed border-muted-foreground/50 rounded-md">
              <p className="text-muted-foreground">{t('paymentsTabPlaceholder')}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard; 