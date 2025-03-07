import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { Property, User } from '../types';
import { getPropertyById, getCurrentUser } from '../utils/supabase';
import { getUserSubscription } from '../utils/supabase';
import { formatCurrency, formatDate } from '../lib/utils';
import { loadRazorpayScript, createRazorpayOrder, initializeRazorpayPayment, verifyRazorpayPayment } from '../utils/razorpay';
import { MapPin, Calendar, IndianRupee, Home, Bed, Bath, Lock, Phone, Mail, User as UserIcon } from 'lucide-react';

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isBlurred, setIsBlurred] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        
        // Fetch property details
        const propertyData = await getPropertyById(id);
        setProperty(propertyData);
        
        if (propertyData) {
          // Fetch owner details
          const { data: ownerData, error: ownerError } = await supabase
            .from('users')
            .select('*')
            .eq('id', propertyData.owner_id)
            .single();
            
          if (!ownerError) {
            setOwner(ownerData as User);
          }
        }
        
        // Check if user is logged in and has subscription
        const userData = await getCurrentUser();
        setCurrentUser(userData);
        
        if (userData) {
          const subscription = await getUserSubscription(userData.id);
          setHasSubscription(!!subscription);
          
          if (subscription) {
            setIsBlurred(false);
          }
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
        toast.error(t('errorFetchingPropertyDetails'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, t]);

  const handleSubscribe = async (planType: 'weekly' | 'monthly') => {
    if (!currentUser) {
      navigate('/login?redirect=property/' + id);
      return;
    }
    
    try {
      setPaymentLoading(true);
      
      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error(t('failedToLoadPaymentGateway'));
        return;
      }
      
      // Set amount based on plan type
      const amount = planType === 'weekly' ? 99 * 100 : 299 * 100; // in paise
      
      // Create order
      const { orderId, error } = await createRazorpayOrder(
        amount,
        'subscription',
        currentUser.id,
        { plan_type: planType }
      );
      
      if (error || !orderId) {
        toast.error(error || t('failedToCreateOrder'));
        return;
      }
      
      // Initialize payment
      initializeRazorpayPayment(
        {
          amount,
          currency: 'INR',
          name: 'PG Life',
          description: `${planType === 'weekly' ? t('oneWeekPlan') : t('oneMonthPlan')}`,
          order_id: orderId,
          handler: async (response) => {
            // Verify payment
            const { success, error } = await verifyRazorpayPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
              'subscription',
              currentUser.id,
              { plan_type: planType }
            );
            
            if (success) {
              toast.success(t('subscriptionSuccessful'));
              setHasSubscription(true);
              setIsBlurred(false);
            } else {
              toast.error(error || t('paymentVerificationFailed'));
            }
          },
          prefill: {
            name: currentUser.name,
            email: currentUser.email,
            contact: currentUser.phone_number || '',
          },
          notes: {
            payment_type: 'subscription',
            user_id: currentUser.id,
            plan_type: planType,
          },
          theme: {
            color: '#4f46e5',
          },
        },
        () => {
          toast.success(t('paymentSuccessful'));
          setHasSubscription(true);
          setIsBlurred(false);
        },
        (error) => {
          console.error('Payment failed:', error);
          toast.error(t('paymentFailed'));
        }
      );
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error(t('errorInitiatingPayment'));
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleContactOwner = () => {
    if (!currentUser) {
      navigate('/login?redirect=property/' + id);
      return;
    }
    
    if (!hasSubscription) {
      toast.error(t('subscriptionRequiredToContactOwner'));
      return;
    }
    
    // Show contact information
    toast.success(t('contactInfoShown'));
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-64 bg-muted rounded-lg mb-6"></div>
            <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-24 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('propertyNotFound')}</h1>
          <p className="text-muted-foreground mb-6">{t('propertyNotFoundDescription')}</p>
          <Button onClick={() => navigate('/properties')}>{t('browseProperties')}</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Property Images */}
        <div className="mb-8">
          <div className="relative h-[400px] rounded-lg overflow-hidden mb-2">
            {isBlurred ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10 text-white">
                <Lock className="h-12 w-12 mb-4" />
                <h3 className="text-xl font-bold mb-2">{t('unlockFullAccess')}</h3>
                <p className="text-center mb-4 max-w-md">{t('subscriptionRequired')}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => handleSubscribe('weekly')} 
                    disabled={paymentLoading}
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    {t('oneWeekPlan')} - ₹99
                  </Button>
                  <Button 
                    onClick={() => handleSubscribe('monthly')} 
                    disabled={paymentLoading}
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    {t('oneMonthPlan')} - ₹299
                  </Button>
                </div>
              </div>
            ) : null}
            <img
              src={property.images[activeImageIndex]}
              alt={property.title}
              className={`w-full h-full object-cover ${isBlurred ? 'blur-md' : ''}`}
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {property.images.map((image, index) => (
              <div
                key={index}
                className={`h-20 rounded-md overflow-hidden cursor-pointer ${
                  index === activeImageIndex ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveImageIndex(index)}
              >
                <img
                  src={image}
                  alt={`${property.title} - ${index + 1}`}
                  className={`w-full h-full object-cover ${isBlurred ? 'blur-md' : ''}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin className="h-5 w-5 mr-1" />
              <span>{property.location}, {property.city}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-card p-4 rounded-lg">
                <div className="flex items-center text-primary mb-1">
                  <IndianRupee className="h-5 w-5 mr-1" />
                  <span className="font-semibold">{t('rent')}</span>
                </div>
                <p className="text-lg font-bold">{formatCurrency(property.rent_amount)}</p>
              </div>
              <div className="bg-card p-4 rounded-lg">
                <div className="flex items-center text-primary mb-1">
                  <IndianRupee className="h-5 w-5 mr-1" />
                  <span className="font-semibold">{t('deposit')}</span>
                </div>
                <p className="text-lg font-bold">{formatCurrency(property.deposit_amount)}</p>
              </div>
              <div className="bg-card p-4 rounded-lg">
                <div className="flex items-center text-primary mb-1">
                  <Home className="h-5 w-5 mr-1" />
                  <span className="font-semibold">{t('propertyType')}</span>
                </div>
                <p className="text-lg font-bold">{property.property_type}</p>
              </div>
              <div className="bg-card p-4 rounded-lg">
                <div className="flex items-center text-primary mb-1">
                  <Calendar className="h-5 w-5 mr-1" />
                  <span className="font-semibold">{t('availableFrom')}</span>
                </div>
                <p className="text-lg font-bold">{formatDate(property.available_from)}</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">{t('description')}</h2>
              <p className={`text-muted-foreground ${isBlurred ? 'blur-md' : ''}`}>
                {property.description}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">{t('amenities')}</h2>
              <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 ${isBlurred ? 'blur-md' : ''}`}>
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">{t('address')}</h2>
              <p className={`text-muted-foreground ${isBlurred ? 'blur-md' : ''}`}>
                {property.address}, {property.city}, {property.state} - {property.pincode}
              </p>
            </div>
          </div>

          {/* Owner Information */}
          <div>
            <div className="bg-card p-6 rounded-lg shadow-sm mb-4">
              <h2 className="text-xl font-semibold mb-4">{t('ownerDetails')}</h2>
              {owner ? (
                <div className={isBlurred ? 'blur-md' : ''}>
                  <div className="flex items-center mb-4">
                    {owner.profile_image ? (
                      <img
                        src={owner.profile_image}
                        alt={owner.name}
                        className="h-12 w-12 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground mr-3">
                        <UserIcon className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{owner.name}</h3>
                      <p className="text-sm text-muted-foreground">{t('propertyOwner')}</p>
                    </div>
                  </div>
                  
                  {hasSubscription ? (
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-primary mr-2" />
                        <a href={`tel:${owner.phone_number}`} className="hover:text-primary">
                          {owner.phone_number || t('notProvided')}
                        </a>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-primary mr-2" />
                        <a href={`mailto:${owner.email}`} className="hover:text-primary">
                          {owner.email}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm mb-4">
                      {t('subscribeToViewContactDetails')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-muted mr-3"></div>
                    <div>
                      <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-32"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-muted rounded w-full mb-3"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </div>
              )}
              
              <div className="mt-6">
                {!currentUser ? (
                  <Button className="w-full" onClick={() => navigate('/login?redirect=property/' + id)}>
                    {t('loginToContact')}
                  </Button>
                ) : !hasSubscription ? (
                  <div className="space-y-3">
                    <Button 
                      className="w-full" 
                      onClick={() => handleSubscribe('weekly')}
                      disabled={paymentLoading}
                    >
                      {t('oneWeekPlan')} - ₹99
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => handleSubscribe('monthly')}
                      disabled={paymentLoading}
                    >
                      {t('oneMonthPlan')} - ₹299
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full" onClick={handleContactOwner}>
                    {t('contactOwner')}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Property Status */}
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">{t('propertyStatus')}</h2>
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${
                  property.status === 'booked' ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
                <span className="font-medium">
                  {property.status === 'booked' ? t('booked') : t('available')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetails; 