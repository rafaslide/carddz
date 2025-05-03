
import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, LogOut, User, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, isAuthenticated, logout, hasRole, isLoading } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado para rastrear se estamos em modo demonstração
  const [isDemoMode, setIsDemoMode] = useState(false);
  // Estado para rastrear o papel simulado em demonstração
  const [demoRole, setDemoRole] = useState<string | null>(null);

  // Detectar se este é um acesso demonstrativo
  useEffect(() => {
    const isDemoAccess = location.pathname.includes('/admin/') || 
                         location.pathname.includes('/restaurant/');
    
    if (isDemoAccess && !isAuthenticated) {
      setIsDemoMode(true);
      if (location.pathname.includes('/admin/')) {
        setDemoRole('admin');
      } else if (location.pathname.includes('/restaurant/')) {
        setDemoRole('restaurant');
      } else {
        setDemoRole('customer');
      }
    }
  }, [location.pathname, isAuthenticated]);

  // Redirecionamento para login modificado para permitir demonstração
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !location.pathname.startsWith('/login') && !isDemoMode) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname, isDemoMode]);

  // Handle logout
  const handleLogout = async () => {
    if (isDemoMode) {
      // Se estamos em modo demo, apenas voltar para a tela de login
      setIsDemoMode(false);
      setDemoRole(null);
      navigate('/login');
    } else {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
  };

  // Determinar o que mostrar na navegação com base no papel do usuário
  const renderNavigation = () => {
    if (!isAuthenticated && !isDemoMode) return null;

    const currentRole = isDemoMode ? demoRole : profile?.role;

    if (currentRole === 'admin' || hasRole('admin')) {
      return (
        <div className="flex space-x-4">
          <Link to="/admin/restaurants" className="text-white hover:text-gray-200">
            Restaurantes
          </Link>
        </div>
      );
    }

    if (currentRole === 'restaurant' || hasRole('restaurant')) {
      return (
        <div className="flex space-x-4">
          <Link to="/restaurant/products" className="text-white hover:text-gray-200">
            Produtos
          </Link>
          <Link to="/restaurant/orders" className="text-white hover:text-gray-200">
            Pedidos
          </Link>
        </div>
      );
    }

    if (currentRole === 'customer' || hasRole('customer')) {
      return (
        <div className="flex space-x-4">
          <Link to="/" className="text-white hover:text-gray-200">
            Cardápio
          </Link>
          <Link to="/orders" className="text-white hover:text-gray-200">
            Meus Pedidos
          </Link>
        </div>
      );
    }

    return null;
  };

  // Determinar o nome do usuário a exibir
  const getUserName = () => {
    if (isDemoMode) {
      if (demoRole === 'admin') return 'Admin (Demo)';
      if (demoRole === 'restaurant') return 'Restaurant (Demo)';
      return 'Customer (Demo)';
    }
    
    return profile?.name || 'Usuário';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-brand text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold">
              Carddz
            </Link>
          </div>

          {renderNavigation()}

          {(isAuthenticated || isDemoMode) && (
            <div className="flex items-center space-x-4">
              {(hasRole('customer') || demoRole === 'customer') && (
                <Button variant="ghost" size="sm" className="text-white relative" onClick={() => navigate('/cart')}>
                  <ShoppingCart size={20} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              )}

              <div className="flex items-center gap-2">
                <User size={20} />
                <span className="hidden md:inline">{getUserName()}</span>
              </div>

              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white">
                <LogOut size={20} />
                <span className="hidden md:inline ml-2">Sair</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 p-4 text-center text-gray-600">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} Carddz - App de Pedidos para Restaurantes</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
