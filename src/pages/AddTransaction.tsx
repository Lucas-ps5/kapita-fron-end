import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatAmount } from '@/lib/format';
import { toast } from 'sonner';
import {
  ArrowLeft, ShoppingCart, Bus, UtensilsCrossed, Smartphone, Home, Tag,
  Receipt, Wrench, CreditCard, DollarSign, Briefcase, HelpCircle, PenLine, Crown
} from 'lucide-react';

// Expense categories
const expenseCategories = [
  { value: 'stock', label: 'Stock', icon: ShoppingCart },
  { value: 'transport', label: 'Transport', icon: Bus },
  { value: 'nourriture', label: 'Nourriture', icon: UtensilsCrossed },
  { value: 'credit', label: 'Crédit tel.', icon: Smartphone },
  { value: 'loyer', label: 'Loyer', icon: Home },
  { value: 'salaire_employe', label: 'Salaire employé', icon: Briefcase },
  { value: 'autre', label: 'Autre', icon: Tag },
];

// Income categories - universal set
const incomeCategories = [
  { value: 'vente', label: 'Vente', icon: Receipt },
  { value: 'service', label: 'Service rendu', icon: Wrench },
  { value: 'credit_paye', label: 'Crédit payé', icon: CreditCard },
  { value: 'salaire', label: 'Salaire', icon: DollarSign },
  { value: 'autre', label: 'Autre', icon: Tag },
];


export default function AddTransaction() {
  const { user, loading } = useAuth();
  const { type } = useParams<{ type: 'income' | 'expense' }>();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [checkingLimit, setCheckingLimit] = useState(true);

  useEffect(() => {
    if (!user) return;
    const checkLimits = async () => {
      // Check subscription
      const { data: sub } = await supabase
        .from('user_subscription')
        .select('plan, expires_at')
        .eq('user_id', user.id)
        .maybeSingle();

      const isPremium = sub?.plan === 'premium' && (!sub.expires_at || new Date(sub.expires_at) > new Date());

      if (isPremium) {
        setCheckingLimit(false);
        return;
      }

      // Count total transactions
      const { count: totalCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if ((totalCount ?? 0) < 50) {
        // Under 50 total → no daily limit
        setCheckingLimit(false);
        return;
      }

      // Count today's transactions
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count: todayTxns } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStart.toISOString());

      const tc = todayTxns ?? 0;
      setTodayCount(tc);
      setDailyLimitReached(tc >= 5);
      setCheckingLimit(false);
    };
    checkLimits();
  }, [user]);

  if (loading || checkingLimit) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (type !== 'income' && type !== 'expense') return <Navigate to="/dashboard" replace />;

  const isIncome = type === 'income';
  const categories = isIncome ? incomeCategories : expenseCategories;

  const handleAmountChange = (val: string) => {
    const digits = val.replace(/\D/g, '');
    setAmount(digits);
  };

  const handleSubmit = async () => {
    const numAmount = parseInt(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Entre un montant valide');
      return;
    }

    const finalCategory = category === 'autre' && customCategory
      ? customCategory
      : category || null;

    setSubmitting(true);
    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      type,
      amount: numAmount,
      note: note || null,
      category: finalCategory,
    });

    if (error) {
      toast.error("Erreur lors de l'ajout");
    } else {
      toast.success(isIncome ? 'Entrée ajoutée !' : 'Sortie ajoutée !');
      navigate('/dashboard', { replace: true });
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 px-5 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="rounded-full p-2 hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {isIncome ? '💰 Ajouter argent reçu' : '💸 Ajouter argent sorti'}
        </h1>
      </header>

      <div className="flex-1 px-5 space-y-5 max-w-lg mx-auto w-full">
        {/* Daily limit banner */}
        {dailyLimitReached && (
          <Card className="border-warning/50 bg-warning/10">
            <CardContent className="flex items-start gap-3 p-4">
              <Crown className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Limite journalière atteinte</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tu as utilisé tes 5 transactions du jour. Passe en Premium pour des transactions illimitées !
                </p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => navigate('/premium')}
                >
                  <Crown className="h-4 w-4 mr-1" /> Passer Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!dailyLimitReached && todayCount > 0 && todayCount >= 3 && (
          <p className="text-xs text-center text-muted-foreground">
            {5 - todayCount} transaction{5 - todayCount > 1 ? 's' : ''} restante{5 - todayCount > 1 ? 's' : ''} aujourd'hui
          </p>
        )}

        {/* Amount Display */}
        <div className="flex flex-col items-center py-6">
          <p className="text-sm text-muted-foreground mb-2">Montant (FCFA)</p>
          <p className={`text-5xl font-extrabold tracking-tight ${isIncome ? 'text-primary' : 'text-destructive'}`}>
            {amount ? formatAmount(parseInt(amount)) : '0'}
          </p>
        </div>

        {/* Amount Input */}
        <Input
          type="tel"
          inputMode="numeric"
          placeholder="Entrer le montant"
          value={amount ? formatAmount(parseInt(amount)) : ''}
          onChange={(e) => handleAmountChange(e.target.value)}
          className="h-14 text-center text-xl font-semibold"
          autoFocus
        />

        {/* Categories */}
        <div>
          <p className="text-sm font-medium text-foreground mb-3">
            {isIncome ? 'Source' : 'Catégorie'}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <Card
                  key={c.value}
                  className={`cursor-pointer transition-all ${
                    category === c.value
                      ? 'border-primary bg-accent ring-1 ring-primary/20'
                      : 'border-border hover:border-primary/40'
                  }`}
                  onClick={() => setCategory(c.value)}
                >
                  <CardContent className="flex flex-col items-center gap-1.5 p-3">
                    <span className={category === c.value ? 'text-primary' : 'text-muted-foreground'}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-medium">{c.label}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Custom category input when "autre" is selected */}
        {category === 'autre' && (
          <Input
            placeholder="Précise la catégorie..."
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            className="h-12 text-base"
          />
        )}

        {/* Note */}
        <Input
          placeholder="Note (optionnel)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="h-12 text-base"
        />
      </div>

      <div className="px-5 py-4 safe-area-bottom max-w-lg mx-auto w-full">
        <Button
          className="h-14 w-full text-base font-semibold"
          onClick={handleSubmit}
          disabled={submitting || !amount || dailyLimitReached}
        >
          {dailyLimitReached ? 'Limite atteinte' : submitting ? 'Enregistrement...' : 'Valider'}
        </Button>
      </div>
    </div>
  );
}
