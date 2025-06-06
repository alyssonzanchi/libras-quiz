import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { Lock } from 'lucide-react';

type Challenge = {
  id: string;
  title: string;
  description: string;
  required_score: number;
  has_questions: boolean;
};

export default function HomePage() {
  const navigate = useNavigate();

  const { profile } = useProfile();
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    const fetchChallenges = async () => {
      const { data } = await supabase
        .from('challenges')
        .select(`id, title, description, required_score, questions(id)`)
        .order('required_score', { ascending: true });
      if (data) {
        const challengesWithQuestions = data.map((challenge: any) => ({
          ...challenge,
          has_questions:
            Array.isArray(challenge.questions) && challenge.questions.length > 0
        }));
        setChallenges(challengesWithQuestions);
      }
    };

    fetchChallenges();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Olá, {profile?.name} 👋
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Você tem <span className="font-semibold">{profile?.total_score}</span>{' '}
          pontos acumulados.
        </p>

        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Desafios Disponiveis
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {challenges.map((challenge) => {
            const isUnlocked =
              profile && profile.total_score >= challenge.required_score;

            const isComingSoon = !challenge.has_questions;

            return (
              <Card
                key={challenge.id}
                className="relative bg-white shadow-md rounded-xl p-4 overflow-hidden"
              >
                {(isComingSoon || !isUnlocked) && (
                  <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
                    <Lock className="h-12 w-12 text-white" />
                  </div>
                )}

                {isComingSoon && (
                  <div className="absolute top-3 -right-10 w-40 transform rotate-45 bg-yellow-400 text-white text-sm font-bold py-2 text-center z-30 shadow">
                    Em breve
                  </div>
                )}

                <CardContent className={'space-y-2'}>
                  <h3 className="text-xl font-semibold text-blue-800">
                    {challenge.title}
                  </h3>
                  <p className="text-gray-600">{challenge.description}</p>
                  <Button
                    disabled={!isUnlocked || isComingSoon}
                    onClick={() => navigate(`/trail/${challenge.id}`)}
                    className="cursor-pointer"
                  >
                    Iniciar desafio
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
