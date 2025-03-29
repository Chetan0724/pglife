import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from './theme-provider';
import { Button } from './ui/button';
import { supabase } from '../App';
import { User } from '../types';
import { getCurrentUser } from '../utils/supabase';
import { Sun, Moon, Menu, X, User as UserIcon, LogOut, Home, Search, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

const Header = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">PG Life</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-foreground hover:text-primary transition-colors">
            {t('home')}
          </Link>
          <Link to="/properties" className="text-foreground hover:text-primary transition-colors">
            {t('properties')}
          </Link>
          {user && user.is_owner && (
            <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
              {t('Dashboard')}
            </Link>
          )}
          {user && user.role === 'admin' && (
            <Link
              to="/admin-dashboard"
              className={cn(
                "transition-colors hover:text-primary",
                isActive('/admin-dashboard') ? "text-primary font-bold" : "text-foreground/60"
              )}
            >
              {t('adminPanel')}
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-background border border-input rounded-md px-2 py-1 text-sm"
          >
            <option value="en">{t('english')}</option>
            <option value="hi">{t('hindi')}</option>
            <option value="gu">{t('gujarati')}</option>
            <option value="bn">{t('bengali')}</option>
          </select>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* User Actions */}
          {loading ? (
            <div className="h-10 w-20 bg-muted animate-pulse rounded-md"></div>
          ) : user ? (
            <div className="flex items-center space-x-4">
              <Link to="/profile">
                <div className="flex items-center space-x-2">
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigate('/login')}>
                {t('login')}
              </Button>
              <Button onClick={() => navigate('/signup')}>{t('signup')}</Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link
              to="/"
              className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-5 w-5" />
              <span>{t('home')}</span>
            </Link>
            <Link
              to="/properties"
              className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <Search className="h-5 w-5" />
              <span>{t('properties')}</span>
            </Link>
            {user && user.is_owner && (
              <Link
                to="/dashboard"
                className={cn(
                  "flex items-center space-x-2 p-2 hover:bg-muted rounded-md",
                  isActive('/dashboard') ? "text-primary font-bold" : "text-foreground/60"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span>{t('Dashboard')}</span>
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link
                to="/admin-dashboard"
                className={cn(
                  "flex items-center space-x-2 p-2 hover:bg-muted rounded-md",
                  isActive('/admin-dashboard') ? "text-primary font-bold" : "text-foreground/60"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span>{t('adminPanel')}</span>
              </Link>
            )}

            {/* User Actions */}
            {loading ? (
              <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
            ) : user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserIcon className="h-5 w-5" />
                  <span>{t('profile')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{t('logout')}</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Button onClick={() => { navigate('/login'); setIsMenuOpen(false); }}>
                  {t('login')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { navigate('/signup'); setIsMenuOpen(false); }}
                >
                  {t('signup')}
                </Button>
              </div>
            )}

            {/* Language and Theme */}
            <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-background border border-input rounded-md px-2 py-1 text-sm"
              >
                <option value="en">{t('english')}</option>
                <option value="hi">{t('hindi')}</option>
                <option value="gu">{t('gujarati')}</option>
                <option value="bn">{t('bengali')}</option>
              </select>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 