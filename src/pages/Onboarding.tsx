import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Store, Briefcase, GraduationCap, MoreHorizontal, Target, TrendingUp, Users, Wallet, Check } from 'lucide-react';

const activities = [
  { value: 'boutique', label: 'Boutique', icon: Store },
  { value: 'petit_job', label: 'Petit job', icon: Briefcase },
  { value: 'etudiant', label: 'Étudiant', icon: GraduationCap },
  { value: 'autre', label: 'Autre', icon: MoreHorizontal },
];

const goals = [
  { value: 'suivre', label: 'Suivre mon argent', icon: Target },
  { value: 'gagner', label: 'Savoir si je gagne', icon: TrendingUp },
  { value: 'dettes', label: 'Suivre les dettes', icon: Users },
  { value: 'tontine', label: 'Gérer ma tontine', icon: Wallet },
];

export default function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['suivre']);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const toggleActivity = (value: string) => {
    setSelectedActivities((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleGoal = (value: string) => {
    setSelectedGoals((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleFinish = async () => {
    if (selectedActivities.length === 0) {
      toast.error('Choisis au moins une activité');
      return;
    }
    if (selectedGoals.length === 0) {
      toast.error('Choisis au moins un objectif');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from('user_preferences')
      .update({
        activity_type: selectedActivities[0] as any,
        activity_types: selectedActivities,
        goal: selectedGoals[0],
        goals: selectedGoals,
        onboarding_completed: true,
      } as any)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Erreur lors de la sauvegarde');
    } else {
      navigate('/dashboard', { replace: true });
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Wallet className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Bienvenue sur MONAYA !</h1>
        <p className="text-sm text-muted-foreground">Personnalisons ton expérience</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[0, 1].map((i) => (
          <div key={i} className={`h-1.5 w-12 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      {step === 0 && (
        <div className="w-full max-w-sm space-y-4">
          <h2 className="text-lg font-semibold text-center">Quelles sont tes activités ?</h2>
          <p className="text-sm text-muted-foreground text-center">Tu peux en choisir plusieurs</p>
          <div className="grid grid-cols-2 gap-3">
            {activities.map((a) => {
              const selected = selectedActivities.includes(a.value);
              return (
                <Card
                  key={a.value}
                  className={`cursor-pointer transition-all relative ${
                    selected
                      ? 'border-primary bg-accent ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/40'
                  }`}
                  onClick={() => toggleActivity(a.value)}
                >
                  {selected && (
                    <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  <CardContent className="flex flex-col items-center gap-2 p-4">
                    <span className={selected ? 'text-primary' : 'text-muted-foreground'}>
                      <a.icon className="h-6 w-6" />
                    </span>
                    <span className="text-sm font-medium">{a.label}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Button
            className="h-14 w-full text-base font-semibold"
            onClick={() => setStep(1)}
            disabled={selectedActivities.length === 0}
          >
            Continuer
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="w-full max-w-sm space-y-4">
          <h2 className="text-lg font-semibold text-center">Quels sont tes objectifs ?</h2>
          <p className="text-sm text-muted-foreground text-center">Tu peux en choisir plusieurs</p>
          <div className="space-y-3">
            {goals.map((g) => {
              const selected = selectedGoals.includes(g.value);
              return (
                <Card
                  key={g.value}
                  className={`cursor-pointer transition-all relative ${
                    selected
                      ? 'border-primary bg-accent ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/40'
                  }`}
                  onClick={() => toggleGoal(g.value)}
                >
                  {selected && (
                    <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  <CardContent className="flex items-center gap-3 p-4">
                    <span className={selected ? 'text-primary' : 'text-muted-foreground'}>
                      <g.icon className="h-6 w-6" />
                    </span>
                    <span className="text-sm font-medium">{g.label}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-14 flex-1 text-base" onClick={() => setStep(0)}>
              Retour
            </Button>
            <Button className="h-14 flex-1 text-base font-semibold" onClick={handleFinish} disabled={submitting || selectedGoals.length === 0}>
              {submitting ? 'Chargement...' : 'Commencer !'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
