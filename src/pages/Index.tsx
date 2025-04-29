
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { profile, isAuthenticated, hasRole, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index page - Auth state:', { isAuthenticated, isLoading, role: profile?.role });
    
    if (isLoading) return;
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    // Redirect based on role
    if (hasRole('admin')) {
      console.log('Admin role detected, redirecting to admin/restaurants');
      navigate('/admin/restaurants');
    } else if (hasRole('restaurant')) {
      console.log('Restaurant role detected, redirecting to restaurant/products');
      navigate('/restaurant/products');
    } else if (hasRole('customer')) {
      console.log('Customer role detected, redirecting to menu');
      navigate('/');
    } else {
      console.log('No specific role detected, redirecting to root');
      navigate('/');
    }
  }, [isAuthenticated, hasRole, navigate, isLoading, profile?.role]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-6">
        <h1 className="text-3xl font-bold mb-2 text-brand">Carddz</h1>
        <p className="text-gray-600">Redirecionando...</p>
        <Loader2 className="mx-auto mt-4 h-8 w-8 animate-spin text-brand" />
      </div>
    </div>
  );
};

export default Index;
