import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Trail = {
  id: string;
  title: string;
  description: string;
};

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [totalScore, setTotalScore] = useState(0);
  const [trails, setTrails] = useState<Trail[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('users')
        .select('name, total_score')
        .eq('id', user.id)
        .single();

      if (data) {
        setName(data.name);
        setTotalScore(data.total_score);
      }
    };

    const fetchTrails = async () => {
      const { data } = await supabase
        .from('trails')
        .select('id, title, description');
      if (data) {
        setTrails(data);
      }
    };

    fetchProfile();
    fetchTrails();
  }, [user]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Olá, {name} 👋
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Você tem <span className="font-semibold">{totalScore}</span> pontos
          acumulados.
        </p>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Trilhas disponíveis
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {trails.map((trail) => (
          <Card key={trail.id} className="bg-white shadow-md rounded-xl p-4">
            <CardContent className="space-y-2">
              <h3 className="text-xl font-semibold text-blue-800">
                {trail.title}
              </h3>
              <p className="text-gray-600">{trail.description}</p>
              <Button onClick={() => navigate(`/trail/${trail.id}`)}>
                Iniciar trilha
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
