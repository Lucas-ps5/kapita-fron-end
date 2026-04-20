import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface UserPreferences {
  activity_type: string;
  activity_types: string[];
  goal: string;
  currency: string;
  onboarding_completed: boolean;
}

export function useUserPreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetch = async () => {
      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setPrefs({
          activity_type: data.activity_type,
          activity_types: (data as any).activity_types ?? [data.activity_type],
          goal: data.goal,
          currency: data.currency,
          onboarding_completed: data.onboarding_completed,
        });
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  return { prefs, loading };
}
