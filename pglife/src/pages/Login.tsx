import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import Layout from '../components/Layout';

const Login = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get redirect path from URL query params
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/';

  const validateForm = () => {
    if (!email.trim()) {
      toast.error(t('pleaseEnterEmail'));
      return false;
    }
    if (!password.trim()) {
      toast.error(t('pleaseEnterPassword'));
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      
      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          toast.error(t('invalidCredentials'));
        } else if (authError.message.includes('Email not confirmed')) {
          toast.error(t('emailNotConfirmed'));
        } else {
          toast.error(authError.message);
        }
        return;
      }
      
      if (!authData?.user) {
        toast.error(t('loginFailed'));
        return;
      }

      // Fetch user profile data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select()
        .eq('id', authData.user.id)
        .limit(1)
        .maybeSingle();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
        
        // If profile doesn't exist, create it from auth metadata
        if (userError.code === 'PGRST116' || !userData) {
          console.log('Attempting to create user profile from auth data...');
          
          try {
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .upsert({
                id: authData.user.id,
                email: authData.user.email,
                name: authData.user.user_metadata.name || authData.user.email?.split('@')[0],
                phone_number: authData.user.user_metadata.phone_number,
                is_owner: false,
                role: 'user'
              }, {
                onConflict: 'id',
                ignoreDuplicates: false
              })
              .select()
              .single();
              
            if (createError) {
              console.error('Error creating user profile:', createError);
              toast.error('Failed to create user profile. Please try again.');
              await supabase.auth.signOut();
              return;
            }
            
            if (newProfile) {
              console.log('User profile created/updated successfully');
              navigate(redirectPath);
              toast.success(t('welcomeBack', { name: newProfile.name || t('user') }));
              return;
            }
          } catch (createError) {
            console.error('Error in profile creation:', createError);
            toast.error('Failed to set up user profile. Please try again.');
            await supabase.auth.signOut();
            return;
          }
        } else {
          toast.error('Error accessing user profile. Please try again.');
          await supabase.auth.signOut();
          return;
        }
      }

      if (!userData) {
        console.log('No user data found, creating profile...');
        
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .upsert({
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.user_metadata.name || authData.user.email?.split('@')[0],
            phone_number: authData.user.user_metadata.phone_number,
            is_owner: false,
            role: 'user'
          }, {
            onConflict: 'id',
            ignoreDuplicates: false
          })
          .select()
          .single();
          
        if (createError || !newProfile) {
          console.error('Error creating user profile:', createError);
          toast.error('Failed to create user profile. Please try again.');
          await supabase.auth.signOut();
          return;
        }
        
        // Use the newly created profile
        userData = newProfile;
      }

      // Handle redirects based on user role
      if (userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.is_owner && redirectPath === '/owner') {
        navigate('/owner');
      } else {
        navigate(redirectPath);
      }
      
      toast.success(t('welcomeBack', { name: userData.name || t('user') }));
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error(t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-card rounded-xl shadow-lg card-shadow p-6 md:p-8 glass-effect">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text mb-2">
              {t('login')}
            </h1>
            <p className="text-muted-foreground">
              {t('welcomeBack')}
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground/90">
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-background border border-input hover:border-primary/50 input-focus"
                placeholder="your.email@example.com"
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-foreground/90">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-input hover:border-primary/50 input-focus pr-10"
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:text-primary/90 font-medium hover:underline"
                  tabIndex={loading ? -1 : 0}
                >
                  {t('forgotPassword')}
                </Link>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin mr-2" />
                  {t('loggingIn')}
                </div>
              ) : (
                t('login')
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t('dontHaveAccount')}{' '}
              <Link 
                to="/signup" 
                className="text-primary hover:text-primary/90 font-medium hover:underline"
                tabIndex={loading ? -1 : 0}
              >
                {t('signup')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login; 