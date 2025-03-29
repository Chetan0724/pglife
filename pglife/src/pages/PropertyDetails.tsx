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
import { MapPin, Calendar, IndianRupee, Home, Bed, Bath, Lock, Phone, Mail, User as UserIcon, Star, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';
import { motion, AnimatePresence } from 'framer-motion';

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
          <div className="animate-pulse space-y-8">
            <div className="h-[400px] bg-muted rounded-xl mb-6"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-24 bg-muted rounded-lg"></div>
              <div className="h-24 bg-muted rounded-lg"></div>
              <div className="h-24 bg-muted rounded-lg"></div>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-4">{t('propertyNotFound')}</h1>
            <p className="text-muted-foreground mb-6">{t('propertyNotFoundDescription')}</p>
            <Button 
              onClick={() => navigate('/properties')}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {t('browseProperties')}
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Property Images Carousel */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative rounded-xl overflow-hidden shadow-2xl">
            <AnimatePresence>
              {isBlurred && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 text-white"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                  >
                    <Lock className="h-16 w-16 mb-6 mx-auto text-primary" />
                    <h3 className="text-2xl font-bold mb-3">{t('unlockFullAccess')}</h3>
                    <p className="text-center mb-6 max-w-md text-white/90">{t('subscriptionRequired')}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          onClick={() => handleSubscribe('weekly')} 
                          disabled={paymentLoading}
                          className="bg-white text-primary hover:bg-white/90 font-semibold px-6 py-3 rounded-xl w-full sm:w-auto"
                        >
                          <div className="flex flex-col items-center">
                            <span>{t('oneWeekPlan')}</span>
                            <span className="text-xl font-bold">₹99</span>
                          </div>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          onClick={() => handleSubscribe('monthly')} 
                          disabled={paymentLoading}
                          className="bg-primary text-white hover:bg-primary/90 font-semibold px-6 py-3 rounded-xl w-full sm:w-auto"
                        >
                          <div className="flex flex-col items-center">
                            <span>{t('oneMonthPlan')}</span>
                            <span className="text-xl font-bold">₹299</span>
                          </div>
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Carousel className="w-full">
              <CarouselContent>
                {property.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <motion.div 
                      className="h-[500px] relative"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <img
                        src={image}
                        alt={`${property.title} - Image ${index + 1}`}
                        className={`w-full h-full object-cover ${isBlurred ? 'filter blur-md scale-105' : ''} transition-all duration-300`}
                      />
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>
        </motion.div>

        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            className="lg:col-span-2 space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center mb-2">
                    <Star className="h-5 w-5 text-yellow-500 mr-1" />
                    <span className="font-semibold">{property.rating}</span>
                    <span className="text-muted-foreground ml-1">({property.reviews} reviews)</span>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {property.property_type}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex items-center">
                    <IndianRupee className="h-5 w-5 text-primary mr-2" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('rent')}</p>
                      <p className="font-semibold">{formatCurrency(property.rent_amount)}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex items-center">
                    <Home className="h-5 w-5 text-primary mr-2" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('furnishing')}</p>
                      <p className="font-semibold capitalize">{property.furnishing_status}</p>
                    </div>
                  </CardContent>
                </Card>
                {property.bedrooms && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 flex items-center">
                      <Bed className="h-5 w-5 text-primary mr-2" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t('bedrooms')}</p>
                        <p className="font-semibold">{property.bedrooms}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {property.bathrooms && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 flex items-center">
                      <Bath className="h-5 w-5 text-primary mr-2" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t('bathrooms')}</p>
                        <p className="font-semibold">{property.bathrooms}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('description')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {property.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Owner Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{t('ownerDetails')}</CardTitle>
                <CardDescription>{t('contactOwner')}</CardDescription>
              </CardHeader>
              <CardContent>
                {owner && (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="font-semibold">{owner.name}</p>
                        <p className="text-sm text-muted-foreground">{t('propertyOwner')}</p>
                      </div>
                    </div>
                    
                    {hasSubscription ? (
                      <motion.div 
                        className="space-y-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-primary mr-2" />
                          <span>{owner.phone_number}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-primary mr-2" />
                          <span>{owner.email}</span>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>••• ••• ••••</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>••••••@•••••.•••</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleContactOwner}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  disabled={loading || !owner}
                >
                  {hasSubscription ? (
                    <span className="flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      {t('contactOwner')}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      {t('subscribeToContact')}
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetails; 