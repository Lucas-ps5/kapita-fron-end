import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCFA, formatDate } from '@/lib/format';
import AppLayout from '@/components/AppLayout';
import PaginationControls from '@/components/PaginationControls';
import { usePagination } from '@/hooks/usePagination';
import { toast } from 'sonner';
import { Plus, Trash2, Coins, CalendarClock, Banknote, X, HandCoins, History } from 'lucide-react';

interface Tontine {
  id: string;
  name: string;
  frequency: string;
  amount: number;
  cagnotte: number | null;
  status: string;
  start_date: string | null;
  duration_months: number | null;
  created_at: string;
}

interface TontinePayment {
  id: string;
  tontine_id: string;
  amount: number;
  paid_at: string;
  note: string | null;
}

const frequencies = [
  { value: 'daily', label: 'Journalier' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'biweekly', label: 'Bi-mensuel' },
  { value: 'monthly', label: 'Mensuel' },
];

export default function Tontines() {
  const { user, loading } = useAuth();
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [payments, setPayments] = useState<Record<string, TontinePayment[]>>({});
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [amount, setAmount] = useState('');
  const [cagnotte, setCagnotte] = useState('');
  const [startDate, setStartDate] = useState('');
  const [durationMonths, setDurationMonths] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [historyTontine, setHistoryTontine] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('tontines')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setTontines((data as any) ?? []);

    const { data: pays } = await supabase
      .from('tontine_payments')
      .select('*')
      .eq('user_id', user.id)
      .order('paid_at', { ascending: false });

    const grouped: Record<string, TontinePayment[]> = {};
    (pays as any ?? []).forEach((p: TontinePayment) => {
      if (!grouped[p.tontine_id]) grouped[p.tontine_id] = [];
      grouped[p.tontine_id].push(p);
    });
    setPayments(grouped);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleCreate = async () => {
    if (!user || !name.trim() || !amount) return;
    setSubmitting(true);
    const { error } = await supabase.from('tontines').insert({
      user_id: user.id,
      name: name.trim(),
      frequency,
      amount: parseInt(amount),
      cagnotte: cagnotte ? parseInt(cagnotte) : null,
      start_date: startDate || null,
      duration_months: durationMonths ? parseInt(durationMonths) : null,
    } as any);
    if (error) {
      toast.error('Erreur lors de la création');
    } else {
      toast.success('Tontine créée !');
      setName(''); setAmount(''); setCagnotte(''); setStartDate(''); setDurationMonths(''); setShowForm(false);
      fetchData();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('tontines').delete().eq('id', id);
    if (!error) {
      toast.success('Tontine supprimée');
      fetchData();
    }
  };

  const handlePay = async (tontine: Tontine) => {
    if (!user) return;
    const { error } = await supabase.from('tontine_payments').insert({
      tontine_id: tontine.id,
      user_id: user.id,
      amount: tontine.amount,
    } as any);
    if (!error) {
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'expense' as any,
        amount: tontine.amount,
        category: 'Tontine',
        note: `Versement tontine: ${tontine.name}`,
      });
      toast.success('Versement enregistré !');
      fetchData();
    }
  };

  const handleBouffer = async (tontine: Tontine) => {
    if (!user || !tontine.cagnotte) return;
    // Record cagnotte as income
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'income' as any,
      amount: tontine.cagnotte,
      category: 'Tontine',
      note: `Cagnotte reçue: ${tontine.name}`,
    });
    // Mark tontine as completed
    await supabase.from('tontines').update({ status: 'completed' } as any).eq('id', tontine.id);
    toast.success('Cagnotte encaissée ! 🎉');
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const freqLabel = (f: string) => frequencies.find((x) => x.value === f)?.label ?? f;
  const totalPaid = (id: string) => (payments[id] ?? []).reduce((s, p) => s + p.amount, 0);
  const historyPayments = historyTontine ? (payments[historyTontine] ?? []) : [];
  const historyTontineName = tontines.find((t) => t.id === historyTontine)?.name ?? '';

  return (
    <AppLayout>
      <header className="flex items-center justify-between px-5 pt-6 pb-2 md:px-8">
        <h1 className="text-lg font-bold text-foreground md:text-xl">Mes Tontines</h1>
        <Button size="sm" className="gap-1" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Fermer' : 'Nouvelle'}
        </Button>
      </header>

      <div className="px-5 md:px-8 space-y-4 flex-1 pb-24 md:pb-8">
        {showForm && (
          <Card className="border-primary/30">
            <CardContent className="p-4 space-y-3">
              <Input placeholder="Nom de la tontine" value={name} onChange={(e) => setName(e.target.value)} />
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger><SelectValue placeholder="Fréquence" /></SelectTrigger>
                <SelectContent>
                  {frequencies.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Montant du versement" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Input type="number" placeholder="Cagnotte (optionnel)" value={cagnotte} onChange={(e) => setCagnotte(e.target.value)} />
              <Input type="date" placeholder="Date de début (optionnel)" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input type="number" placeholder="Durée en mois (optionnel)" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} />
              <Button className="w-full" onClick={handleCreate} disabled={submitting || !name.trim() || !amount}>
                {submitting ? 'Création...' : 'Créer la tontine'}
              </Button>
            </CardContent>
          </Card>
        )}

        {tontines.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Coins className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Aucune tontine pour l'instant</p>
            <p className="text-sm text-muted-foreground">Crée ta première tontine !</p>
          </div>
        )}

        {tontines.length > 0 && (
          <PaginatedTontines
            tontines={tontines}
            payments={payments}
            frequencies={frequencies}
            onDelete={handleDelete}
            onPay={handlePay}
            onBouffer={handleBouffer}
            onShowHistory={setHistoryTontine}
          />
        )}
      </div>

      {/* Payment History Dialog */}
      <Dialog open={!!historyTontine} onOpenChange={(open) => !open && setHistoryTontine(null)}>
        <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historique — {historyTontineName}</DialogTitle>
          </DialogHeader>
          {historyPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucun versement</p>
          ) : (
            <PaginatedPaymentHistory payments={historyPayments} />
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function PaginatedTontines({
  tontines, payments, frequencies, onDelete, onPay, onBouffer, onShowHistory,
}: {
  tontines: Tontine[];
  payments: Record<string, TontinePayment[]>;
  frequencies: { value: string; label: string }[];
  onDelete: (id: string) => void;
  onPay: (t: Tontine) => void;
  onBouffer: (t: Tontine) => void;
  onShowHistory: (id: string) => void;
}) {
  const pagination = usePagination(tontines);
  const freqLabel = (f: string) => frequencies.find((x) => x.value === f)?.label ?? f;
  const totalPaid = (id: string) => (payments[id] ?? []).reduce((s, p) => s + p.amount, 0);

  return (
    <>
      {pagination.items.map((t) => (
        <Card key={t.id} className={`border-border/50 ${t.status === 'completed' ? 'opacity-60' : ''}`}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{t.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <div className="flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{freqLabel(t.frequency)}</span>
                  </div>
                  {t.start_date && (
                    <span className="text-xs text-muted-foreground">• Début: {formatDate(t.start_date)}</span>
                  )}
                  {t.duration_months && (
                    <span className="text-xs text-muted-foreground">• {t.duration_months} mois</span>
                  )}
                  {t.status === 'completed' && (
                    <span className="text-xs text-primary font-medium">✓ Terminée</span>
                  )}
                </div>
              </div>
              <button onClick={() => onDelete(t.id)} className="p-1 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-muted p-2">
                <p className="text-xs text-muted-foreground">Versement</p>
                <p className="font-bold text-foreground">{formatCFA(t.amount)}</p>
              </div>
              {t.cagnotte && (
                <div className="rounded-lg bg-accent p-2">
                  <p className="text-xs text-muted-foreground">Cagnotte</p>
                  <p className="font-bold text-primary">{formatCFA(t.cagnotte)}</p>
                </div>
              )}
              <div className="rounded-lg bg-muted p-2">
                <p className="text-xs text-muted-foreground">Total versé</p>
                <p className="font-bold text-foreground">{formatCFA(totalPaid(t.id))}</p>
              </div>
              <div
                className="rounded-lg bg-muted p-2 cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => onShowHistory(t.id)}
              >
                <p className="text-xs text-muted-foreground">Nb versements</p>
                <p className="font-bold text-foreground flex items-center gap-1">
                  {(payments[t.id] ?? []).length}
                  <History className="h-3 w-3 text-muted-foreground" />
                </p>
              </div>
            </div>

            {t.status !== 'completed' && (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => onPay(t)}>
                  <Banknote className="h-4 w-4" />
                  Tontiner
                </Button>
                {t.cagnotte && (
                  <Button variant="default" className="flex-1 gap-2" onClick={() => onBouffer(t)}>
                    <HandCoins className="h-4 w-4" />
                    Bouffer
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      <PaginationControls {...pagination} />
    </>
  );
}

function PaginatedPaymentHistory({ payments }: { payments: TontinePayment[] }) {
  const pagination = usePagination(payments);

  return (
    <div className="space-y-2">
      {pagination.items.map((p) => (
        <div key={p.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{formatCFA(p.amount)}</p>
            <p className="text-xs text-muted-foreground">{formatDate(p.paid_at)}</p>
          </div>
          {p.note && <p className="text-xs text-muted-foreground">{p.note}</p>}
        </div>
      ))}
      <PaginationControls {...pagination} />
    </div>
  );
}
