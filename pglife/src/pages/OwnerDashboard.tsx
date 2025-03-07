import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { Property, User } from '../types';
import { getCurrentUser } from '../utils/supabase';
import { formatCurrency, formatDate } from '../lib/utils';
import { loadRazorpayScript, createRazorpayOrder, initializeRazorpayPayment, verifyRazorpayPayment } from '../utils/razorpay';
import { Plus, Home, Settings, LayoutDashboard, Upload, Edit, Trash, CheckCircle, XCircle, AlertCircle, Eye, Star, Users, IndianRupee } from 'lucide-react';

// Mock data for properties
const mockProperties = [
  {
    id: '1',
    title: 'Modern 1BHK Apartment',
    location: 'Koramangala, Bangalore',
    rent_amount: 15000,
    deposit_amount: 30000,
    property_type: '1BHK',
    furnishing_status: 'furnished',
    images: ['/images/property1.jpg'],
    status: 'approved',
    created_at: '2023-05-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Spacious 2BHK Flat',
    location: 'HSR Layout, Bangalore',
    rent_amount: 22000,
    deposit_amount: 44000,
    property_type: '2BHK',
    furnishing_status: 'semi-furnished',
    images: ['/images/property2.jpg'],
    status: 'pending',
    created_at: '2023-06-20T14:45:00Z',
  },
  {
    id: '3',
    title: 'PG for Women',
    location: 'Indiranagar, Bangalore',
    rent_amount: 9000,
    deposit_amount: 18000,
    property_type: 'PG',
    furnishing_status: 'furnished',
    images: ['/images/property3.jpg'],
    status: 'booked',
    created_at: '2023-04-10T09:15:00Z',
  },
];

const OwnerDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    totalBookings: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        
        if (!userData) {
          navigate('/login');
          return;
        }
        
        if (!userData.is_owner) {
          navigate('/profile');
          toast.error(t('notAnOwner'));
          return;
        }
        
        setUser(userData);
        
        // Fetch owner's properties
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select(`
            *,
            bookings (
              id,
              status,
              amount
            )
          `)
          .eq('owner_id', userData.id);
          
        if (propertiesError) {
          console.error('Error fetching properties:', propertiesError);
          // Use mock data for now
          setProperties(mockProperties as any);
        } else {
          setProperties(propertiesData as Property[]);
        }

        // Calculate statistics
        const activeListings = propertiesData?.filter(p => p.status === 'approved').length || 0;
        const totalBookings = propertiesData?.reduce((acc, prop) => 
          acc + (prop.bookings?.length || 0), 0) || 0;
        const totalEarnings = propertiesData?.reduce((acc, prop) => 
          acc + prop.bookings?.reduce((sum, booking) => 
            sum + (booking.status === 'completed' ? booking.amount : 0), 0) || 0, 0) || 0;

        setStats({
          totalProperties: propertiesData?.length || 0,
          activeListings,
          totalBookings,
          totalEarnings,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error(t('errorFetchingData'));
        // Use mock data for now
        setProperties(mockProperties as any);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate, t]);

  const handleAddProperty = () => {
    navigate('/owner/add-property');
  };

  const handleEditProperty = (id: string) => {
    navigate(`/owner/edit-property/${id}`);
  };

  const handleDeleteProperty = async (id: string) => {
    if (window.confirm(t('confirmDeleteProperty'))) {
      try {
        const { error } = await supabase
          .from('properties')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error('Error deleting property:', error);
          toast.error(t('errorDeletingProperty'));
          return;
        }
        
        setProperties(properties.filter(property => property.id !== id));
        toast.success(t('propertyDeleted'));
      } catch (error) {
        console.error('Error:', error);
        toast.error(t('errorDeletingProperty'));
      }
    }
  };

  const handleMarkAsBooked = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: 'booked' })
        .eq('id', id);
        
      if (error) {
        console.error('Error updating property status:', error);
        toast.error(t('errorUpdatingStatus'));
        return;
      }
      
      setProperties(
        properties.map(property =>
          property.id === id ? { ...property, status: 'booked' } : property
        )
      );
      toast.success(t('propertyMarkedAsBooked'));
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('errorUpdatingStatus'));
    }
  };

  const handleMarkAsAvailable = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: 'approved' })
        .eq('id', id);
        
      if (error) {
        console.error('Error updating property status:', error);
        toast.error(t('errorUpdatingStatus'));
        return;
      }
      
      setProperties(
        properties.map(property =>
          property.id === id ? { ...property, status: 'approved' } : property
        )
      );
      toast.success(t('propertyMarkedAsAvailable'));
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('errorUpdatingStatus'));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('approved')}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t('pending')}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            {t('rejected')}
          </span>
        );
      case 'booked':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('booked')}
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <h1 className="text-3xl font-bold mb-2">{t('ownerDashboard')}</h1>
            <p className="text-muted-foreground">
              {t('welcomeOwner')}, {user?.name}
            </p>
          </div>
          <Button onClick={handleAddProperty} className="mt-4 md:mt-0">
            <Plus className="mr-2 h-4 w-4" /> {t('addProperty')}
          </Button>
        </div>

        {/* Dashboard Tabs */}
        <div className="border-b border-border mb-6">
          <nav className="flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'properties'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
              onClick={() => setActiveTab('properties')}
            >
              <Home className="w-4 h-4 inline mr-2" />
              {t('myProperties')}
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              {t('settings')}
            </button>
          </nav>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-card p-6 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{t('totalProperties')}</h3>
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">{stats.totalProperties}</p>
              </div>

              <div className="bg-card p-6 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{t('activeListings')}</h3>
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">{stats.activeListings}</p>
              </div>

              <div className="bg-card p-6 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{t('totalBookings')}</h3>
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">{stats.totalBookings}</p>
              </div>

              <div className="bg-card p-6 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{t('totalEarnings')}</h3>
                  <IndianRupee className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(stats.totalEarnings)}
                </p>
              </div>
            </div>

            {/* Recent Properties */}
            <h2 className="text-xl font-semibold mb-4">{t('recentProperties')}</h2>
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('property')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('location')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('rent')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('status')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {properties.slice(0, 5).map((property) => (
                      <tr key={property.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0">
                              <img
                                src={property.images[0]}
                                alt={property.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">{property.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {property.property_type}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {property.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatCurrency(property.rent_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(property.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/property/${property.id}`)}
                              className="text-primary hover:text-primary/80"
                              title={t('view')}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditProperty(property.id)}
                              className="text-primary hover:text-primary/80"
                              title={t('edit')}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {properties.length > 5 && (
                <div className="px-6 py-3 border-t border-border">
                  <Button
                    variant="link"
                    onClick={() => setActiveTab('properties')}
                    className="p-0 h-auto"
                  >
                    {t('viewAllProperties')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{t('myProperties')}</h2>
              <Button onClick={handleAddProperty} size="sm">
                <Plus className="mr-2 h-4 w-4" /> {t('addProperty')}
              </Button>
            </div>

            {properties.length === 0 ? (
              <div className="bg-card rounded-lg shadow-sm p-8 text-center">
                <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('noPropertiesYet')}</h3>
                <p className="text-muted-foreground mb-6">{t('noPropertiesDescription')}</p>
                <Button onClick={handleAddProperty}>
                  <Plus className="mr-2 h-4 w-4" /> {t('addYourFirstProperty')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property.id} className="bg-card rounded-lg shadow-sm overflow-hidden">
                    <div className="relative h-48">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(property.status)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-1">{property.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2">{property.location}</p>
                      <p className="text-lg font-bold text-primary mb-4">
                        {formatCurrency(property.rent_amount)}
                        <span className="text-sm font-normal text-muted-foreground">/month</span>
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted">
                          {property.property_type}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted">
                          {property.furnishing_status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/property/${property.id}`)}
                          >
                            {t('view')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProperty(property.id)}
                          >
                            {t('edit')}
                          </Button>
                        </div>
                        <div className="flex space-x-2">
                          {property.status === 'approved' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsBooked(property.id)}
                            >
                              {t('markAsBooked')}
                            </Button>
                          ) : property.status === 'booked' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsAvailable(property.id)}
                            >
                              {t('markAsAvailable')}
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={() => handleDeleteProperty(property.id)}
                          >
                            <Trash className="h-4 w-4" />
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

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">{t('accountSettings')}</h2>
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">{t('profileInformation')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('profileSettingsDescription')}
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/profile')}
                >
                  {t('editProfile')}
                </Button>
              </div>
              
              <div className="border-t border-border pt-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">{t('notificationSettings')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('notificationSettingsDescription')}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{t('emailNotifications')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('emailNotificationsDescription')}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{t('smsNotifications')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('smsNotificationsDescription')}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold mb-4 text-destructive">{t('dangerZone')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('dangerZoneDescription')}
                </p>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm(t('confirmDeleteAccount'))) {
                      // Handle account deletion
                      toast.error(t('accountDeletionNotImplemented'));
                    }
                  }}
                >
                  {t('deleteAccount')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OwnerDashboard; 