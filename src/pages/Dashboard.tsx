import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCFA } from '@/lib/format';
import AppLayout from '@/components/AppLayout';
import { ArrowDownLeft, ArrowUpRight, Settings, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Tables } from '@/integrations/supabase/types';

type Transaction = Tables<'transactions'>;

const periods = [
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'year', label: 'Année' },
];

function getPeriodStart(period: string): string {
  const now = new Date();
  if (period === 'week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff).toISOString();
  }
  if (period === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }
  return new Date(now.getFullYear(), 0, 1).toISOString();
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingDebtsOwed, setPendingDebtsOwed] = useState(0);
  const [pendingDebtsIOwe, setPendingDebtsIOwe] = useState(0);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      setOnboardingDone(prefs?.onboarding_completed ?? false);

      const { data: txns } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      setTransactions(txns ?? []);

      const { data: debts } = await supabase
        .from('debts')
        .select('type, amount')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (debts) {
        let owed = 0, iOwe = 0;
        debts.forEach((d) => {
          if (d.type === 'owed_to_me') owed += d.amount;
          else iOwe += d.amount;
        });
        setPendingDebtsOwed(owed);
        setPendingDebtsIOwe(iOwe);
      }
    };

    fetchData();
  }, [user]);

  const { dailyBalance, periodIncome, periodExpense, periodBalance, chartData } = useMemo(() => {
    let dailyBalance = 0, periodIncome = 0, periodExpense = 0;
    const periodStart = getPeriodStart(period);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    const buckets: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((t) => {
      const amt = t.type === 'income' ? t.amount : -t.amount;
      if (t.created_at >= todayISO) dailyBalance += amt;
      if (t.created_at >= periodStart) {
        if (t.type === 'income') periodIncome += t.amount;
        else periodExpense += t.amount;

        const d = new Date(t.created_at);
        const key = period === 'year'
          ? d.toLocaleDateString('fr-FR', { month: 'short' })
          : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        if (!buckets[key]) buckets[key] = { income: 0, expense: 0 };
        if (t.type === 'income') buckets[key].income += t.amount;
        else buckets[key].expense += t.amount;
      }
    });

    const chartData = Object.entries(buckets).map(([name, v]) => ({ name, ...v }));

    return { dailyBalance, periodIncome, periodExpense, periodBalance: periodIncome - periodExpense, chartData };
  }, [transactions, period]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (onboardingDone === false) return <Navigate to="/onboarding" replace />;
  if (onboardingDone === null) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <AppLayout>
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6 pb-2 md:px-8">
        <div>
          <p className="text-sm text-muted-foreground">Bonjour 👋</p>
          <h1 className="text-lg font-bold text-foreground md:text-xl">KAPITA</h1>
        </div>
        <button onClick={() => navigate('/settings')} className="rounded-full p-2 hover:bg-muted transition-colors md:hidden">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </button>
      </header>

      <div className="px-5 md:px-8 space-y-4 flex-1">
        {/* Balance Card */}
        <Card className="bg-primary text-primary-foreground border-0 shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm opacity-80 mb-1">Solde du jour</p>
            <p className={`text-4xl md:text-5xl font-extrabold tracking-tight ${dailyBalance < 0 ? 'text-red-200' : ''}`}>
              {formatCFA(dailyBalance)}
            </p>
          </CardContent>
        </Card>

        {/* Period Selector */}
        <div className="flex gap-2">
          {periods.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? 'default' : 'outline'}
              size="sm"
              className="flex-1 rounded-full text-sm"
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Entrées</p>
                <p className="text-sm font-bold text-foreground">{formatCFA(periodIncome)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sorties</p>
                <p className="text-sm font-bold text-foreground">{formatCFA(periodExpense)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 col-span-2 md:col-span-1">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Wallet className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reste</p>
                <p className={`text-sm font-bold ${periodBalance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {formatCFA(periodBalance)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-3">Entrées / Sorties</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={45} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number, name: string) => [formatCFA(value), name === 'income' ? 'Entrées' : 'Sorties']}
                  />
                  <Bar dataKey="income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}


        {(pendingDebtsOwed > 0 || pendingDebtsIOwe > 0) && (
          <div className="grid grid-cols-2 gap-3">
            {pendingDebtsOwed > 0 && (
              <Card className="border-border/50 cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate('/debts')}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">On me doit</p>
                  <p className="text-sm font-bold text-primary">{formatCFA(pendingDebtsOwed)}</p>
                </CardContent>
              </Card>
            )}
            {pendingDebtsIOwe > 0 && (
              <Card className="border-border/50 cursor-pointer hover:border-destructive/40 transition-colors" onClick={() => navigate('/debts')}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Je dois</p>
                  <p className="text-sm font-bold text-destructive">{formatCFA(pendingDebtsIOwe)}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="grid grid-cols-2 gap-3 px-5 py-4 md:px-8 md:max-w-lg">
        <Button
          className="h-16 text-base font-semibold gap-2 rounded-2xl"
          onClick={() => navigate('/transaction/income')}
        >
          <ArrowDownLeft className="h-5 w-5" />
          💰 Argent reçu
        </Button>
        <Button
          variant="outline"
          className="h-16 text-base font-semibold gap-2 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => navigate('/transaction/expense')}
        >
          <ArrowUpRight className="h-5 w-5" />
          💸 Argent sorti
        </Button>
      </div>
    </AppLayout>
  );
}
