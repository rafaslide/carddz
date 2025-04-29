
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { profile, isAuthenticated, hasRole, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Redirect based on role
    if (hasRole('admin')) {
      navigate('/admin/restaurants');
    } else if (hasRole('restaurant')) {
      navigate('/restaurant/products');
    } else {
      // Customer or default
      navigate('/');
    }
  }, [isAuthenticated, hasRole, navigate, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-6">
        <h1 className="text-3xl font-bold mb-2 text-brand">Carddz</h1>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
};

export default Index;
