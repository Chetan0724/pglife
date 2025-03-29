import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { User } from '../types';
import { getCurrentUser, updateUserProfile, becomeOwner } from '../utils/supabase';
import { getUserSubscription } from '../utils/supabase';
import { formatDate } from '../lib/utils';
import { User as UserIcon, Upload, Edit, Check } from 'lucide-react';

const UserProfile = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [becomingOwner, setBecomingOwner] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        
        if (!userData) {
          navigate('/login');
          return;
        }
        
        setUser(userData);
        setName(userData.name);
        setPhone(userData.phone_number || '');
        setProfileImageUrl(userData.profile_image || '');
        
        // Fetch subscription data
        const subscriptionData = await getUserSubscription(userData.id);
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error(t('errorFetchingUserData'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate, t]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('imageTooLarge'));
        return;
      }
      
      setProfileImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      let updatedImageUrl = user.profile_image;
      
      // Upload profile image if changed
      if (profileImage) {
        setUploadingImage(true);
        
        const fileExt = profileImage.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `profile-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, profileImage);
          
        if (uploadError) {
          toast.error(t('errorUploadingImage'));
          return;
        }
        
        const { data } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);
          
        updatedImageUrl = data.publicUrl;
        setUploadingImage(false);
      }
      
      // Update user profile
      const updatedUser = await updateUserProfile(user.id, {
        name,
        phone_number: phone,
        profile_image: updatedImageUrl,
      });
      
      if (updatedUser) {
        setUser(updatedUser);
        toast.success(t('profileUpdated'));
        setIsEditing(false);
      } else {
        toast.error(t('errorUpdatingProfile'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('errorUpdatingProfile'));
    }
  };

  const handleBecomeOwner = async () => {
    if (!user) return;
    
    try {
      setBecomingOwner(true);
      
      const success = await becomeOwner(user.id);
      
      if (success) {
        setUser({ ...user, is_owner: true });
        toast.success(t('becameOwnerSuccess'));
        
        // Redirect to owner dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        toast.error(t('errorBecomingOwner'));
      }
    } catch (error) {
      console.error('Error becoming owner:', error);
      toast.error(t('errorBecomingOwner'));
    } finally {
      setBecomingOwner(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="flex items-center mb-8">
              <div className="h-24 w-24 rounded-full bg-muted mr-6"></div>
              <div>
                <div className="h-8 bg-muted rounded w-48 mb-2"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-24 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('notLoggedIn')}</h1>
          <p className="text-muted-foreground mb-6">{t('pleaseLoginToViewProfile')}</p>
          <Button onClick={() => navigate('/login')}>{t('login')}</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg shadow-sm p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center mb-8">
              <div className="relative mb-4 md:mb-0 md:mr-8">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-muted">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground">
                      <UserIcon className="h-12 w-12" />
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <div className="absolute bottom-0 right-0">
                    <label
                      htmlFor="profile-image"
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground cursor-pointer"
                    >
                      <Upload className="h-4 w-4" />
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileImageChange}
                      />
                    </label>
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        {t('name')}
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={t('fullName')}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">
                        {t('phoneNumber')}
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
                    <p className="text-muted-foreground mb-2">{user.email}</p>
                    {user.phone_number && (
                      <p className="text-muted-foreground">{user.phone_number}</p>
                    )}
                  </>
                )}
              </div>
              
              <div className="mt-4 md:mt-0">
                {isEditing ? (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={uploadingImage}
                      className="flex items-center"
                    >
                      <Check className="mr-1 h-4 w-4" />
                      {uploadingImage ? t('saving') : t('save')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setName(user.name);
                        setPhone(user.phone_number || '');
                        setProfileImageUrl(user.profile_image || '');
                        setProfileImage(null);
                      }}
                    >
                      {t('cancel')}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center"
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    {t('editProfile')}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="border-t border-border pt-6">
              <h2 className="text-xl font-semibold mb-4">{t('accountDetails')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">{t('accountType')}</h3>
                  <p>
                    {user.is_owner
                      ? t('propertyOwner')
                      : user.role === 'admin'
                      ? t('administrator')
                      : t('regularUser')}
                  </p>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">{t('memberSince')}</h3>
                  <p>{formatDate(user.created_at)}</p>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">{t('subscription')}</h3>
                  {subscription ? (
                    <div>
                      <p className="text-primary font-medium">
                        {subscription.plan_type === 'weekly'
                          ? t('oneWeekPlan')
                          : t('oneMonthPlan')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('validUntil')}: {formatDate(subscription.end_date)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p>{t('noActiveSubscription')}</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary"
                        onClick={() => navigate('/properties')}
                      >
                        {t('subscribeNow')}
                      </Button>
                    </div>
                  )}
                </div>
                
                {!user.is_owner && user.role !== 'admin' && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">{t('becomeOwner')}</h3>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {t('becomeOwnerDescription')}
                    </p>
                    <Button
                      onClick={handleBecomeOwner}
                      disabled={becomingOwner}
                      size="sm"
                    >
                      {becomingOwner ? t('processing') : t('becomeOwner')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {user.is_owner && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full md:w-auto"
              >
                {t('goToOwnerDashboard')}
              </Button>
            </div>
          )}
          
          {user.role === 'admin' && (
            <div className="text-center">
              <Button onClick={() => navigate('/admin')} size="lg">
                {t('Go To AdminDashboard')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile; 