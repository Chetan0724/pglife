import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { getCurrentUser } from '../utils/supabase';
import { supabase } from '../utils/supabase';
import { User } from '../types';
import { useState, useEffect } from 'react';
import { Home, User as UserIcon, LogOut, Menu, X, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link to="/" className="mr-6 flex items-center space-x-2 hover-effect">
              <Home className="h-6 w-6 text-primary" />
              <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
                PG Life
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link
                to="/"
                className={cn(
                  "transition-colors hover:text-primary",
                  isActive('/') ? "text-primary font-bold" : "text-foreground/60"
                )}
              >
                {t('home')}
              </Link>
              {user?.is_owner && (
                <Link
                  to="/owner-dashboard"
                  className={cn(
                    "transition-colors hover:text-primary",
                    isActive('/owner-dashboard') ? "text-primary font-bold" : "text-foreground/60"
                  )}
                >
                  {t('dashboard')}
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin-dashboard"
                  className={cn(
                    "transition-colors hover:text-primary",
                    isActive('/admin-dashboard') ? "text-primary font-bold" : "text-foreground/60"
                  )}
                >
                  {t('adminDashboard')}
                </Link>
              )}
            </nav>

            <nav className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="h-9 w-9 hover:bg-primary/10"
              >
                <Globe className="h-4 w-4" />
              </Button>
              
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center space-x-2">
                      <Link to="/profile">
                        <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                          <UserIcon className="mr-2 h-4 w-4 text-primary" />
                          <span className="font-medium">{user.name}</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="h-9 w-9 hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4 text-destructive" />
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
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
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
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background">
          <nav className="container flex flex-col space-y-2 py-4">
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
      )}

      {/* Main Content */}
      <main className="flex-1 gradient-bg">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container py-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Home className="h-6 w-6 text-primary" />
            <span className="font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
              PG Life
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-primary transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="hover:text-primary transition-colors">
              Contact
            </Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
            © {new Date().getFullYear()} PG Life. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 