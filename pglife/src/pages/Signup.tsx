import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import Layout from '../components/Layout';

const Signup = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      toast.error(t('pleaseEnterName'));
      return false;
    }
    if (!email.trim()) {
      toast.error(t('pleaseEnterEmail'));
      return false;
    }
    if (!password.trim()) {
      toast.error(t('pleaseEnterPassword'));
      return false;
    }
    if (!confirmPassword.trim()) {
      toast.error(t('pleaseConfirmPassword'));
      return false;
    }
    if (password !== confirmPassword) {
      toast.error(t('passwordsDoNotMatch'));
      return false;
    }
    if (password.length < 6) {
      toast.error(t('passwordTooShort'));
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('invalidEmail'));
      return false;
    }
    // Basic phone validation if provided
    if (phone && !/^\+?[\d\s-]{10,}$/.test(phone)) {
      toast.error(t('invalidPhone'));
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // First, check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.trim())
        .maybeSingle();

      if (existingUser) {
        toast.error(t('emailAlreadyRegistered'));
        return;
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            name: name.trim(),
            phone_number: phone.trim() || null,
          },
          emailRedirectTo: `${window.location.origin}/login`
        },
      });
      
      if (authError) {
        console.error('Auth error:', authError);
        if (authError.message.includes('already registered')) {
          toast.error(t('emailAlreadyRegistered'));
        } else {
          console.error('Signup error details:', authError);
          toast.error('Unable to create account. Please try again later.');
        }
        return;
      }
      
      if (!authData?.user) {
        toast.error(t('signupFailed'));
        return;
      }

      console.log('Auth successful, creating user profile...');
      
      // Create user profile in the database
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: email.trim(),
          name: name.trim(),
          phone_number: phone.trim() || null,
          is_owner: false,
          role: 'user'
        })
        .select()
        .single();
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        
        // Try to clean up the auth user if profile creation fails
        try {
          await supabase.auth.signOut();
          console.log('Signed out user after profile creation failure');
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }

        toast.error('Unable to complete signup. Please try again.');
        return;
      }
      
      console.log('Profile created successfully');
      toast.success(t('signupSuccessful'));
      toast.info(t('pleaseCheckEmail'));
      navigate('/login');
      
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(t('signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-card rounded-xl shadow-lg card-shadow p-6 md:p-8 glass-effect">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text mb-2">
              {t('signup')}
            </h1>
            <p className="text-muted-foreground">
              {t('createAccount')}
            </p>
          </div>
          
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground/90">
                {t('name')}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-background border border-input hover:border-primary/50 input-focus"
                placeholder={t('fullName')}
                disabled={loading}
                required
              />
            </div>
            
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
              <label htmlFor="phone" className="block text-sm font-medium mb-2 text-foreground/90">
                {t('phoneNumber')} <span className="text-muted-foreground text-xs">({t('optional')})</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-background border border-input hover:border-primary/50 input-focus"
                placeholder="+91 98765 43210"
                disabled={loading}
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
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {t('passwordRequirements')}
              </p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-foreground/90">
                {t('confirmPassword')}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-input hover:border-primary/50 input-focus pr-10"
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
                  {t('signingUp')}
                </div>
              ) : (
                t('signup')
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t('alreadyHaveAccount')}{' '}
              <Link 
                to="/login" 
                className="text-primary hover:text-primary/90 font-medium hover:underline"
                tabIndex={loading ? -1 : 0}
              >
                {t('login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Signup; 