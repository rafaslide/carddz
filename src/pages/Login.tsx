
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
    } catch (err) {
      setError('Email ou senha inválidos. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setIsLoading(true);
    setCreatingDemoAccount(true);
    
    try {
      let userEmail = '';
      let userPassword = 'password';
      
      if (role === 'admin') {
        userEmail = 'admin@carddz.com';
      } else if (role === 'restaurant') {
        userEmail = 'restaurant@carddz.com';
      } else {
        userEmail = 'customer@carddz.com';
      }
      
      // Reset password for demo accounts
      try {
        // First, check if password needs to be updated
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: userEmail, 
          password: userPassword
        });
        
        if (authError) {
          // If login fails, try to create a new user
          const { data: userData, error: signupError } = await supabase.auth.signUp({
            email: userEmail,
            password: userPassword,
            options: {
              data: {
                name: role === 'admin' ? 'Admin User' : role === 'restaurant' ? 'Restaurant Owner' : 'Customer',
                role: role
              }
            }
          });
          
          if (signupError) {
            throw signupError;
          }
          
          // If user was created, sign in
          if (userData && !userData.session) {
            toast({
              title: "Conta criada",
              description: "Uma conta de demonstração foi criada. Por favor, faça login.",
            });
          }
        }
        
        // Login with the account
        await login(userEmail, userPassword);
        
        toast({
          title: "Login realizado com sucesso",
          description: "Você foi autenticado com sucesso como " + role,
        });
      } catch (err) {
        setError('Erro ao fazer login. Por favor, tente novamente.');
        console.error(err);
      }
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
                  {isLoading ? 'Entrando...' : 'Entrar'}
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
                {creatingDemoAccount ? 'Configurando...' : 'Admin'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleDemoLogin('restaurant')}
                disabled={isLoading || creatingDemoAccount}
              >
                {creatingDemoAccount ? 'Configurando...' : 'Restaurante'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleDemoLogin('customer')}
                disabled={isLoading || creatingDemoAccount}
              >
                {creatingDemoAccount ? 'Configurando...' : 'Cliente'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
