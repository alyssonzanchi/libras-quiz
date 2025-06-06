import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{
    id: string;
    name: string;
    total_score: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      setLoading(true);
      const { data } = await supabase
        .from('users')
        .select('id, name, total_score')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  return { profile, loading };
}
