
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Email ou senha inválidos. Por favor, tente novamente.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectAccess = async (role: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Acessar diretamente a rota desejada
      if (role === 'admin') {
        toast({
          title: "Acesso direto",
          description: "Redirecionando para o painel administrativo",
        });
        navigate('/admin/restaurants');
      } else if (role === 'restaurant') {
        toast({
          title: "Acesso direto",
          description: "Redirecionando para o painel do restaurante",
        });
        navigate('/restaurant/products');
      } else {
        toast({
          title: "Acesso direto",
          description: "Redirecionando para o menu",
        });
        navigate('/menu');
      }
    } catch (err: any) {
      console.error('Error in direct access:', err);
      setError('Erro ao acessar. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-brand">Carddz</h1>
          <p className="text-gray-600">Sistema de pedidos para restaurantes</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Faça login para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...</> : 
                    'Entrar'
                  }
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-brand hover:underline">
                Registrar-se
              </Link>
            </p>
            
            <div className="w-full border-t pt-4">
              <p className="text-sm text-gray-600 mb-4 text-center">Ou acesse diretamente um dos painéis:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                <Button 
                  variant="outline"
                  onClick={() => handleDirectAccess('admin')}
                  disabled={isLoading}
                  size="sm"
                >
                  Admin
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleDirectAccess('restaurant')}
                  disabled={isLoading}
                  size="sm"
                >
                  Restaurante
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleDirectAccess('customer')}
                  disabled={isLoading}
                  size="sm"
                >
                  Cliente
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
