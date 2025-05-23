
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'restaurant' | 'customer'>('customer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Attempting to register user:', { name, email, role });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role,
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        setError(error.message);
        return;
      }

      console.log('Registration successful:', data);
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Você foi registrado e pode fazer login agora.",
      });
      
      // Redirect to login page
      navigate('/login');
      
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err?.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-brand">Carddz</h1>
          <p className="text-gray-600">Criar nova conta</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Registro</CardTitle>
            <CardDescription>
              Preencha os dados para criar sua conta
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
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                
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
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="role">Tipo de conta</Label>
                  <Select value={role} onValueChange={(value: 'admin' | 'restaurant' | 'customer') => setRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de conta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Cliente</SelectItem>
                      <SelectItem value="restaurant">Restaurante</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando conta...</> : 
                    'Criar conta'
                  }
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-brand hover:underline">
                Fazer login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
