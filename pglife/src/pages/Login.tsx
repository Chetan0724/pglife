import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

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
              toast.success(t('Welcome Back', { name: newProfile.name || t('user') }));
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
      
      toast.success(t('Welcome Back', { name: userData.name || t('user') }));
      
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
      <div 
        className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-background to-muted/20 py-16 px-4"
      >
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/50">
            <div className="p-8">
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text mb-2">
                  {t('login')}
                </h1>
                <p className="text-muted-foreground">
                  {t('Welcome Back')}
                </p>
              </motion.div>
              
              <motion.form 
                onSubmit={handleLogin} 
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground/90">
                    {t('email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-input hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      placeholder="your.email@example.com"
                      disabled={loading}
                      required
                    />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <label htmlFor="password" className="block text-sm font-medium mb-2 text-foreground/90">
                    {t('password')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-2.5 rounded-lg bg-background border border-input hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={togglePasswordVisibility}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-primary hover:text-primary/90 font-medium hover:underline transition-colors"
                      tabIndex={loading ? -1 : 0}
                    >
                      {t('Forgot Password')}
                    </Link>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg group transition-all duration-300 hover:shadow-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin mr-2" />
                        {t('loggingIn')}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                        {t('login')}
                      </div>
                    )}
                  </Button>
                </motion.div>
              </motion.form>

              <motion.div 
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <p className="text-muted-foreground">
                  {t('Don\'t have an account?')}{' '}
                  <Link 
                    to="/signup" 
                    className="text-primary hover:text-primary/90 font-medium hover:underline transition-colors"
                  >
                    {t('signUp')}
                  </Link>
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Login; 