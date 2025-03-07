import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface OwnerRouteProps {
  user: any;
  children: React.ReactNode;
}

const OwnerRoute = ({ user, children }: OwnerRouteProps) => {
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOwnerStatus = async () => {
      if (!user) {
        setIsOwner(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user has owner role in the database
        const { data, error } = await supabase
          .from('users')
          .select('is_owner')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking owner status:', error);
          setIsOwner(false);
        } else {
          setIsOwner(data?.is_owner === true);
        }
      } catch (error) {
        console.error('Error:', error);
        setIsOwner(false);
      } finally {
        setLoading(false);
      }
    };

    checkOwnerStatus();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Checking permissions...</div>;
  }

  if (!user || !isOwner) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default OwnerRoute; 