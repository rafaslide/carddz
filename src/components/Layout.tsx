
import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, LogOut, User, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, logout, hasRole, isLoading } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !location.pathname.startsWith('/login')) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine what to render in the navigation based on user role
  const renderNavigation = () => {
    if (!isAuthenticated) return null;

    if (hasRole('admin')) {
      return (
        <div className="flex space-x-4">
          <Link to="/admin/restaurants" className="text-white hover:text-gray-200">
            Restaurantes
          </Link>
        </div>
      );
    }

    if (hasRole('restaurant')) {
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

    if (hasRole('customer')) {
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

          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              {hasRole('customer') && (
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
                <span className="hidden md:inline">{user?.name}</span>
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
