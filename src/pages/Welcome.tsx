import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export default function Welcome() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-4 mb-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-lg">
          <Wallet className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">KAPITA</h1>
        <p className="text-lg text-muted-foreground text-center max-w-xs">
          Ton argent, simplifié. Suis tes entrées et sorties en moins de 10 secondes.
        </p>
      </div>

      <Button
        className="h-16 w-full max-w-sm text-lg font-bold rounded-2xl shadow-lg"
        onClick={() => navigate('/auth')}
      >
        Commencer
      </Button>

      <p className="mt-6 text-sm text-muted-foreground">
        Gratuit · Sans pub · Fait pour le Cameroun 🇨🇲
      </p>
    </div>
  );
}
