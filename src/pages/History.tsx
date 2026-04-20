import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCFA, formatDateShort } from '@/lib/format';
import { toast } from 'sonner';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Trash2, History as HistoryIcon } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import PaginationControls from '@/components/PaginationControls';
import { usePagination } from '@/hooks/usePagination';
import type { Tables } from '@/integrations/supabase/types';

type Transaction = Tables<'transactions'>;

const filterOptions = [
  { value: 'all', label: 'Tout' },
  { value: 'income', label: 'Entrées' },
  { value: 'expense', label: 'Sorties' },
];

export default function History() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState('all');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('type', filter as 'income' | 'expense');
      }

      const { data } = await query;
      setTransactions(data ?? []);
      setFetching(false);
    };
    fetch();
  }, [user, filter]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
      toast.error('Erreur de suppression');
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success('Transaction supprimée');
    }
  };

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <AppLayout>
      <header className="flex items-center gap-3 px-5 pt-6 pb-2 md:px-8">
        <button onClick={() => navigate('/dashboard')} className="rounded-full p-2 hover:bg-muted transition-colors md:hidden">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground md:text-xl">Historique</h1>
      </header>

      {/* Filters */}
      <div className="flex gap-2 px-5 py-3 md:px-8">
        {filterOptions.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            className="rounded-full text-sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 px-5 pb-4 space-y-2 md:px-8 md:max-w-2xl">
        {fetching ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <HistoryIcon className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">Aucune transaction</p>
          </div>
        ) : (
          <PaginatedTransactions transactions={transactions} onDelete={handleDelete} />
        )}
      </div>
    </AppLayout>
  );
}

function PaginatedTransactions({ transactions, onDelete }: { transactions: Transaction[]; onDelete: (id: string) => void }) {
  const pagination = usePagination(transactions);

  return (
    <>
      {pagination.items.map((t) => (
        <Card key={t.id} className="border-border/50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                t.type === 'income' ? 'bg-accent' : 'bg-destructive/10'
              }`}>
                {t.type === 'income' ? (
                  <ArrowDownLeft className="h-5 w-5 text-primary" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-destructive" />
                )}
              </div>
              <div>
                <p className={`text-sm font-semibold ${
                  t.type === 'income' ? 'text-primary' : 'text-destructive'
                }`}>
                  {t.type === 'income' ? '+' : '-'}{formatCFA(t.amount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.category || t.note || (t.type === 'income' ? 'Entrée' : 'Sortie')}
                  {' · '}
                  {formatDateShort(t.created_at)}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDelete(t.id)}
              className="rounded-full p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      ))}
      <PaginationControls {...pagination} />
    </>
  );
}
