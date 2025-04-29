
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [creatingDemoAccount, setCreatingDemoAccount] = useState(false);
  
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
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setIsLoading(true);
    setCreatingDemoAccount(true);
    setError('');
    
    try {
      let userEmail = '';
      let userPassword = 'password';
      let userName = '';
      
      if (role === 'admin') {
        userEmail = 'admin@carddz.com';
        userName = 'Admin User';
      } else if (role === 'restaurant') {
        userEmail = 'restaurant@carddz.com';
        userName = 'Restaurant Owner';
      } else {
        userEmail = 'customer@carddz.com';
        userName = 'Customer';
      }
      
      // Primeiro, tente fazer login
      try {
        await login(userEmail, userPassword);
        return;
      } catch (loginErr) {
        console.log('Usuário não encontrado, tentando criar...', loginErr);
        
        // Se falhar no login, tente criar o usuário
        const { data: userData, error: signupError } = await supabase.auth.signUp({
          email: userEmail,
          password: userPassword,
          options: {
            data: {
              name: userName,
              role: role
            }
          }
        });
        
        if (signupError) {
          console.error('Erro ao criar conta:', signupError);
          throw signupError;
        }
        
        // Se o usuário foi criado, faça login
        if (userData) {
          toast({
            title: "Conta criada",
            description: "Uma conta de demonstração foi criada. Por favor, aguarde enquanto fazemos login.",
          });
          
          // Aguarde um momento para o trigger de criação de perfil executar
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          await login(userEmail, userPassword);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao fazer login. Por favor, tente novamente.');
      console.error('Erro ao criar conta ou fazer login:', err);
    } finally {
      setIsLoading(false);
      setCreatingDemoAccount(false);
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
          
          <CardFooter className="flex flex-col">
            <p className="text-sm text-gray-600 mb-4">Ou entre com um dos usuários de demonstração:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
              <Button 
                variant="outline"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading || creatingDemoAccount}
              >
                {creatingDemoAccount ? 
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Configurando...</> : 
                  'Admin'
                }
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleDemoLogin('restaurant')}
                disabled={isLoading || creatingDemoAccount}
              >
                {creatingDemoAccount ? 
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Configurando...</> : 
                  'Restaurante'
                }
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleDemoLogin('customer')}
                disabled={isLoading || creatingDemoAccount}
              >
                {creatingDemoAccount ? 
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Configurando...</> : 
                  'Cliente'
                }
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
