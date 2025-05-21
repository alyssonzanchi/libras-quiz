import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function LoginRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const handleSignIn = async () => {
    setErrorMessage('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setErrorMessage('Credenciais inválidas. Verifique e tente novamente.');
      return;
    }

    if (data.user) {
      login(data.user);
      navigate('/home');
    }
  };

  const handleSignUp = async () => {
    setErrorMessage('');
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      setErrorMessage(
        'Erro ao cadastrar. Verifique os dados e tente novamente.'
      );
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      await supabase.from('profiles').insert([
        {
          id: userId,
          name,
          points: 0
        }
      ]);
    }

    navigate('/home');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
        <div className="hidden md:flex flex-col justify-center items-center bg-blue-100 p-10 w-full md:w-1/2">
          <img
            src="/libras-illustration.png"
            alt="Ilustração Libras"
            className="w-72 mb-6"
          />
          <h2 className="text-3xl font-bold text-blue-900">
            Bem-vindo ao LibrasQuiz!
          </h2>
          <p className="text-blue-800 text-center mt-4">
            Aprenda Libras de forma interativa com quizzes e trilhas de
            conhecimento.
          </p>
        </div>

        <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            Acesse sua conta
          </h2>

          <Tabs
            defaultValue="login"
            value={tab}
            onValueChange={(value) => {
              setTab(value as 'login' | 'register');
              setErrorMessage('');
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login" className="cursor-pointer">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="cursor-pointer">
                Cadastro
              </TabsTrigger>
            </TabsList>

            {errorMessage && (
              <div className="text-red-600 text-sm mb-4 text-center">
                {errorMessage}
              </div>
            )}

            <TabsContent value="login">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignIn();
                }}
                className="space-y-4"
              >
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full cursor-pointer">
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignUp();
                }}
                className="space-y-4"
              >
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full cursor-pointer">
                  Cadastrar
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
