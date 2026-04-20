import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Check, X, Crown, Phone } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';

const features = [
  { label: 'Historique 30 jours', free: true, premium: true },
  { label: 'Historique illimité', free: false, premium: true },
  { label: 'Gestion des dettes', free: false, premium: true },
  { label: 'Gestion des tontines', free: false, premium: true },
  { label: 'Résumé mensuel', free: false, premium: true },
  { label: 'Export des données', free: false, premium: true },
];

export default function Premium() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data } = await supabase
        .from('user_subscription')
        .select('plan, expires_at')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data?.plan === 'premium') {
        const expires = data.expires_at ? new Date(data.expires_at) : null;
        setIsPremium(!expires || expires > new Date());
      }
    };
    check();
  }, [user]);

  const handlePayment = async () => {
    if (!phone || phone.length < 8) {
      toast.error('Entre un numéro valide');
      return;
    }
    setProcessing(true);
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 2000));

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { error } = await supabase
      .from('user_subscription')
      .update({
        plan: 'premium',
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq('user_id', user!.id);

    if (error) {
      toast.error('Erreur lors du paiement');
    } else {
      toast.success('🎉 Bienvenue en Premium !');
      setIsPremium(true);
      setShowPayment(false);
    }
    setProcessing(false);
  };

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <AppLayout>
      <header className="flex items-center gap-3 px-5 pt-6 pb-2 md:px-8">
        <button onClick={() => navigate('/dashboard')} className="rounded-full p-2 hover:bg-muted transition-colors md:hidden">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground md:text-xl">Premium</h1>
      </header>

      <div className="flex-1 px-5 py-4 space-y-5 md:px-8 md:max-w-2xl">
        <div className="flex flex-col items-center py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/20">
            <Crown className="h-8 w-8 text-warning" />
          </div>
          {isPremium ? (
            <>
              <h2 className="mt-3 text-xl font-bold text-primary">Tu es Premium ! 🎉</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Toutes les fonctionnalités sont débloquées
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-3 text-xl font-bold text-foreground">Passe à Premium</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Débloque toutes les fonctionnalités pour mieux gérer ton argent
              </p>
            </>
          )}
        </div>

        <Card className="border-border/50 overflow-hidden">
          <div className="grid grid-cols-3 bg-muted px-4 py-3">
            <span className="text-xs font-medium text-muted-foreground">Fonctionnalité</span>
            <span className="text-xs font-medium text-center text-muted-foreground">Gratuit</span>
            <span className="text-xs font-medium text-center text-primary">Premium</span>
          </div>
          {features.map((f) => (
            <div key={f.label} className="grid grid-cols-3 items-center px-4 py-3 border-t border-border/50">
              <span className="text-sm text-foreground">{f.label}</span>
              <div className="flex justify-center">
                {f.free ? <Check className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-muted-foreground/40" />}
              </div>
              <div className="flex justify-center">
                <Check className="h-4 w-4 text-primary" />
              </div>
            </div>
          ))}
        </Card>

        {!isPremium && (
          <Card className="border-primary/30 bg-accent">
            <CardContent className="flex flex-col items-center p-6">
              <p className="text-3xl font-extrabold text-foreground">500 <span className="text-base font-semibold">FCFA/mois</span></p>
              <p className="text-sm text-muted-foreground mt-1">Paiement Mobile Money</p>
              <Button
                className="mt-4 h-14 w-full text-base font-semibold"
                onClick={() => setShowPayment(true)}
              >
                <Crown className="h-5 w-5 mr-2" />
                Passer Premium
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Paiement Mobile Money</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Montant : <span className="font-bold text-foreground">500 FCFA</span>
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Numéro de téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="Ex: 077 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 pl-10"
                />
              </div>
            </div>
            <Button
              className="h-14 w-full text-base font-semibold"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? 'Traitement en cours...' : 'Confirmer le paiement'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Simulation de paiement — aucun montant ne sera débité
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
