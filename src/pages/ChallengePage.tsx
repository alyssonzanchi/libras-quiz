import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';

type Question = {
  id: string;
  word: string;
  image: string | null;
  options: string[];
};

export function ChallengePage() {
  const { id: challengeId } = useParams();
  const navigate = useNavigate();

  const { profile } = useProfile();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [passed, setPassed] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState('');

  useEffect(() => {
    if (!challengeId) return;

    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('challenge_id', challengeId);

      if (error) {
        console.error(error);
      } else if (data) {
        const shuffled = data.sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, 20));
      }
    };

    const fetchChallengeTitle = async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('title')
        .eq('id', challengeId)
        .single();

      if (error) {
        console.error('Erro ao buscar título do desafio:', error);
      } else {
        setChallengeTitle(data.title);
      }
    };

    fetchQuestions();
    fetchChallengeTitle();
  }, [challengeId]);

  const handleAnswer = (option: string) => {
    const question = questions[current];
    const normalizedTitle = challengeTitle.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const correctAnswer = question.image
      ? question.word // quando pergunta é imagem
      : `/${normalizedTitle}/${question.word.toLowerCase()}.png`; // quando pergunta é letra

    const correct = option === correctAnswer;

    setSelected(option);
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 10);
    }

    setTimeout(() => {
      setSelected(null);
      setIsCorrect(null);
      if (current + 1 < questions.length) {
        setCurrent((prev) => prev + 1);
      } else {
        setFinished(true);
      }
    }, 1000);
  };

  useEffect(() => {
    const saveProgress = async () => {
      if (!finished || !profile?.id || !challengeId || progressSaved) return;

      const pct = Math.round((score / questions.length) * 10);
      setPercentage(pct);
      const passedChallenge = pct >= 70;
      setPassed(passedChallenge);

      if (passedChallenge) {
        const { data: existingProgress, error: fetchError } = await supabase
          .from('progress')
          .select('score')
          .eq('user_id', profile.id)
          .eq('challenge_id', challengeId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Erro ao buscar progresso existente:', fetchError);
          return;
        }

        const previousScore = existingProgress?.score ?? 0;

        if (pct > previousScore) {
          const { error } = await supabase.from('progress').upsert(
            [
              {
                user_id: profile.id,
                challenge_id: challengeId,
                completed: true,
                score: pct
              }
            ],
            { onConflict: 'user_id, challenge_id' }
          );

          if (error) {
            console.error('Erro ao salvar progresso:', error);
          } else {
            const pointsEarned = ((pct - previousScore) / 10) * 10;

            const { error: updateError } = await supabase
              .from('users')
              .update({
                total_score: (profile.total_score ?? 0) + pointsEarned
              })
              .eq('id', profile.id);

            if (updateError) {
              console.error('Erro ao atualizar total_score:', updateError);
            }

            setProgressSaved(true);
          }
        } else {
          setProgressSaved(true);
        }
      }
    };

    saveProgress();
  }, [finished, profile?.id, challengeId, progressSaved]);

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h2 className="text-3xl font-bold mb-4">Desafio Concluído!</h2>

        <div className="text-xl mb-4">
          Você acertou <strong>{score}</strong> de{' '}
          <strong>{questions.length}</strong> perguntas (
          <strong>{percentage}%</strong> de aproveitamento).
        </div>

        {passed ? (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4 border border-green-300">
            🎉 Parabéns! Você foi aprovado e pode prosseguir para o próximo
            desafio.
          </div>
        ) : (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4 border border-red-300">
            😔 Você não atingiu a pontuação mínima de 70%. Tente novamente para
            desbloquear o próximo desafio.
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/home')}
            className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded cursor-pointer"
          >
            Voltar ao início
          </button>

          <button
            onClick={() => {
              setFinished(false);
              setCurrent(0);
              setScore(0);
              setSelected(null);
              setIsCorrect(null);
              setPercentage(0);
              setPassed(false);

              const reshuffled = [...questions].sort(() => 0.5 - Math.random());
              setQuestions(reshuffled.slice(0, 20));
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded cursor-pointer"
          >
            Refazer desafio
          </button>
        </div>
      </div>
    );
  }

  const question = questions[current];

  if (!question) {
    return <LoadingSpinner />;
  }

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-xl w-full p-4 rounded-xl border shadow">
      <div className="absolute top-4 right-4">
        <Button
          onClick={() => navigate('/home')}
          className="text-sm cursor-pointer"
        >
          Voltar
        </Button>
      </div>

      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">
        {challengeTitle || 'Carregando...'}
      </h1>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      <h2 className="text-xl font-bold mb-6">
        Pergunta {current + 1} de {questions.length}
      </h2>

      <p className="text-sm text-gray-500 text-center mb-4">
        Pontuação atual: <span className="font-bold">{score}</span>
      </p>

      <p className="text-center text-gray-600 mb-4 italic">
        Tipo de pergunta: {question.image ? 'Imagem' : 'Letra'}
      </p>

      {question?.image ? (
        <img
          src={question.image}
          alt="Imagem da pergunta"
          className="w-48 h-48 mx-auto mb-6"
        />
      ) : (
        <div className="text-6xl font-bold text-center mb-6">
          {question.word}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {question.options.map((option, index) => {
          const isImage = option.endsWith('.png') || option.endsWith('.jpg');

          return (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className={`p-4 border rounded-lg transition-all duration-300 cursor-pointer ${
                selected === option
                  ? isCorrect
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                  : ''
              }`}
            >
              {isImage ? (
                <img
                  src={option}
                  alt={`Opção ${index + 1}`}
                  className="w-20 h-20 mx-auto"
                />
              ) : (
                <span className="text-xl font-semibold">{option}</span>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="text-center mt-4 text-lg font-semibold">
          {isCorrect ? (
            <span className="text-green-600">✅ Resposta correta!</span>
          ) : (
            <span className="text-red-600">❌ Resposta errada!</span>
          )}
        </div>
      )}
    </div>
  );
}
