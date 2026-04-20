import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCFA, formatDate } from '@/lib/format';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Check, Users } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import PaginationControls from '@/components/PaginationControls';
import { usePagination } from '@/hooks/usePagination';
import type { Tables, Enums } from '@/integrations/supabase/types';

type Debt = Tables<'debts'>;

export default function Debts() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [tab, setTab] = useState<'owed_to_me' | 'i_owe'>('owed_to_me');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ person_name: '', amount: '', description: '', due_date: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchDebts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setDebts(data ?? []);
  };

  useEffect(() => {
    fetchDebts();
  }, [user]);

  const handleAdd = async () => {
    const amt = parseInt(form.amount.replace(/\D/g, ''));
    if (!form.person_name || !amt) {
      toast.error('Remplis le nom et le montant');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('debts').insert({
      user_id: user!.id,
      type: tab,
      person_name: form.person_name,
      amount: amt,
      description: form.description || null,
      due_date: form.due_date || null,
    });
    if (error) {
      toast.error('Erreur');
    } else {
      toast.success('Dette ajoutée');
      setForm({ person_name: '', amount: '', description: '', due_date: '' });
      setDialogOpen(false);
      fetchDebts();
    }
    setSubmitting(false);
  };

  const handleMarkPaid = async (debt: Debt) => {
    setSubmitting(true);
    // Prêt payé (owed_to_me) = income, Emprunt payé (i_owe) = expense
    const txnType: Enums<'transaction_type'> = debt.type === 'owed_to_me' ? 'income' : 'expense';
    const noteText = debt.type === 'owed_to_me'
      ? `Prêt remboursé par ${debt.person_name}`
      : `Emprunt remboursé à ${debt.person_name}`;

    const { data: txn, error: txnError } = await supabase
      .from('transactions')
      .insert({
        user_id: user!.id,
        type: txnType,
        amount: debt.amount,
        note: noteText,
        category: debt.type === 'owed_to_me' ? 'credit_paye' : 'remboursement',
      })
      .select('id')
      .single();

    if (txnError) {
      toast.error('Erreur lors de la création de la transaction');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from('debts')
      .update({ status: 'paid', linked_transaction_id: txn.id })
      .eq('id', debt.id);

    if (error) {
      toast.error('Erreur');
    } else {
      toast.success('Marqué comme payé !');
      fetchDebts();
    }
    setSubmitting(false);
  };

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const filtered = debts.filter((d) => d.type === tab);
  const pending = filtered.filter((d) => d.status === 'pending');
  const paid = filtered.filter((d) => d.status === 'paid');

  return (
    <AppLayout>
      <header className="flex items-center justify-between px-5 pt-6 pb-2 md:px-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="rounded-full p-2 hover:bg-muted transition-colors md:hidden">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground md:text-xl">Dettes</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full gap-1">
              <Plus className="h-4 w-4" /> Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{tab === 'owed_to_me' ? "Quelqu'un me doit" : 'Je dois à quelqu\'un'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input value={form.person_name} onChange={(e) => setForm({ ...form, person_name: e.target.value })} placeholder="Nom de la personne" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label>Montant (FCFA)</Label>
                <Input type="tel" inputMode="numeric" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/\D/g, '') })} placeholder="0" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label>Description (optionnel)</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Pour quoi ?" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label>Date prévue (optionnel)</Label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="h-12" />
              </div>
              <Button className="h-14 w-full text-base font-semibold" onClick={handleAdd} disabled={submitting}>
                {submitting ? 'Ajout...' : 'Ajouter la dette'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 px-5 py-3 md:px-8">
        <Button variant={tab === 'owed_to_me' ? 'default' : 'outline'} size="sm" className="flex-1 rounded-full" onClick={() => setTab('owed_to_me')}>
          On me doit
        </Button>
        <Button variant={tab === 'i_owe' ? 'default' : 'outline'} size="sm" className="flex-1 rounded-full" onClick={() => setTab('i_owe')}>
          Je dois
        </Button>
      </div>

      {/* Debt List */}
      <div className="flex-1 px-5 pb-4 space-y-2 md:px-8 md:max-w-2xl">
        {pending.length === 0 && paid.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">Aucune dette</p>
          </div>
        ) : (
          <PaginatedDebts pending={pending} paid={paid} tab={tab} onMarkPaid={handleMarkPaid} submitting={submitting} />
        )}
      </div>
    </AppLayout>
  );
}

function PaginatedDebts({ pending, paid, tab, onMarkPaid, submitting }: {
  pending: Debt[]; paid: Debt[]; tab: string; onMarkPaid: (d: Debt) => void; submitting: boolean;
}) {
  const allDebts = [...pending, ...paid];
  const pagination = usePagination(allDebts);

  const pagePending = pagination.items.filter((d) => d.status === 'pending');
  const pagePaid = pagination.items.filter((d) => d.status === 'paid');

  return (
    <>
      {pagePending.map((d) => (
        <Card key={d.id} className="border-border/50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">{d.person_name}</p>
              <p className={`text-sm font-bold ${tab === 'owed_to_me' ? 'text-primary' : 'text-destructive'}`}>
                {formatCFA(d.amount)}
              </p>
              {d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}
              {d.due_date && <p className="text-xs text-muted-foreground">Prévu : {formatDate(d.due_date)}</p>}
            </div>
            <Button size="sm" variant="outline" className="gap-1 rounded-full" onClick={() => onMarkPaid(d)} disabled={submitting}>
              <Check className="h-4 w-4" /> Payé
            </Button>
          </CardContent>
        </Card>
      ))}
      {pagePaid.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground pt-4 pb-1">Payées</p>
          {pagePaid.map((d) => (
            <Card key={d.id} className="border-border/50 opacity-60">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground line-through">{d.person_name}</p>
                  <p className="text-sm text-muted-foreground">{formatCFA(d.amount)}</p>
                </div>
                <span className="text-xs text-primary font-medium">✓ Payé</span>
              </CardContent>
            </Card>
          ))}
        </>
      )}
      <PaginationControls {...pagination} />
    </>
  );
}
