import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Trail = {
  id: string;
  name: string;
  description: string;
};

export default function HomePage() {
  const [trails, setTrails] = useState<Trail[]>([]);

  useEffect(() => {
    const fetchTrails = async () => {
      const { data, error } = await supabase.from('trails').select('*');
      if (error) console.error(error);
      else setTrails(data);
    };

    fetchTrails();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trilhas Disponíveis</h1>
      <div className="grid gap-4">
        {trails.map((trail) => (
          <div key={trail.id} className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold">{trail.name}</h2>
            <p className="text-gray-700">{trail.description}</p>
            {/* Em breve: botão para iniciar quiz */}
          </div>
        ))}
      </div>
    </div>
  );
}
