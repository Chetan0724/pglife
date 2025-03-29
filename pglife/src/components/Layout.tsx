import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { getCurrentUser } from '../utils/supabase';
import { supabase } from '../utils/supabase';
import { User } from '../types';
import { useState, useEffect } from 'react';
import { Home, User as UserIcon, LogOut, Menu, X, Globe, Building, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      toast.success(t('logoutSuccessful'));
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error(t('logoutFailed'));
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mr-4 flex"
          >
            <Link to="/" className="mr-6 flex items-center space-x-2 group">
              <Building className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
              <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
                PG Life
              </span>
            </Link>
          </motion.div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 mx-4">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder={t('searchProperties')}
                className="w-full pl-10 bg-muted/50 focus:bg-background"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className={cn(
                "transition-colors hover:text-primary relative group",
                isActive('/') ? "text-primary font-bold" : "text-foreground/60"
              )}
            >
              {t('home')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
            {user?.is_owner && (
              <Link
                to="/owner-dashboard"
                className={cn(
                  "transition-colors hover:text-primary relative group",
                  isActive('/owner-dashboard') ? "text-primary font-bold" : "text-foreground/60"
                )}
              >
                {t('dashboard')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin-dashboard"
                className={cn(
                  "transition-colors hover:text-primary relative group",
                  isActive('/admin-dashboard') ? "text-primary font-bold" : "text-foreground/60"
                )}
              >
                {t('adminDashboard')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            )}
          </nav>

          <nav className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Globe className="h-4 w-4" />
            </Button>
            
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-2">
                    <Link to="/profile">
                      <Button variant="ghost" size="sm" className="hover:bg-primary/10 space-x-2">
                        <UserIcon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{user.name}</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link to="/login">
                      <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                        {t('login')}
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                        {t('signup')}
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b bg-background overflow-hidden"
          >
            <div className="container py-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder={t('searchProperties')}
                  className="w-full pl-10 bg-muted/50 focus:bg-background"
                />
              </div>
              <nav className="flex flex-col space-y-2">
                <Link
                  to="/"
                  className={cn(
                    "px-4 py-2 rounded-md transition-colors hover:bg-primary/10",
                    isActive('/') ? "text-primary bg-primary/5" : ""
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('home')}
                </Link>
                {user?.is_owner && (
                  <Link
                    to="/dashboard"
                    className={cn(
                      "px-4 py-2 rounded-md transition-colors hover:bg-primary/10",
                      isActive('/dashboard') ? "text-primary bg-primary/5" : ""
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('dashboard')}
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin-dashboard"
                    className={cn(
                      "px-4 py-2 rounded-md transition-colors hover:bg-primary/10",
                      isActive('/admin-dashboard') ? "text-primary bg-primary/5" : ""
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('adminDashboard')}
                  </Link>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container py-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Building className="h-6 w-6 text-primary" />
                <span className="font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
                  PG Life
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('footerDescription')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('quickLinks')}</h4>
              <nav className="space-y-2">
                <Link to="/about" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('about')}
                </Link>
                <Link to="/contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('contact')}
                </Link>
                <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('privacy')}
                </Link>
                <Link to="/terms" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('terms')}
                </Link>
              </nav>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('cities')}</h4>
              <nav className="space-y-2">
                <Link to="/city/delhi" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Delhi
                </Link>
                <Link to="/city/mumbai" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Mumbai
                </Link>
                <Link to="/city/bangalore" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Bangalore
                </Link>
                <Link to="/city/hyderabad" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Hyderabad
                </Link>
              </nav>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('contact')}</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>support@pglife.com</p>
                <p>+91 123 456 7890</p>
                <p>123, Main Street</p>
                <p>New Delhi, India</p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PG Life. {t('allRightsReserved')}
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button variant="ghost" size="sm" className="hover:text-primary">
                Facebook
              </Button>
              <Button variant="ghost" size="sm" className="hover:text-primary">
                Twitter
              </Button>
              <Button variant="ghost" size="sm" className="hover:text-primary">
                Instagram
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 